import { db } from "@/database/connection.js";
import { sendgridEmailCreds, smtpEmailCreds } from "@/database/schema/index.js";
import { slugs } from "@/database/seed/email-templates.js";
import { EmailJobData } from "@/email/index.js";
import { addEmailJob } from "@/jobs/email-queue.js";
import { dayjs, getCurrentIndianDate } from "@/utils/date-helpers.js";
import { encrypt } from "@/utils/encryption.js";
import { emailProviders, emailStatus } from "@/utils/enum.js";
import { CustomError } from "@/utils/error-helpers.js";
import { eq } from "drizzle-orm";
import {
  getAllEmailsQuery,
  getEmailAttemptsQuery,
  getEmailTemplatesQuery,
  getEmailTemplateVariablesQuery,
  getSendgridEmailCredsQuery,
  getSmtpEmailCredsQuery,
  insertEmailsQuery,
} from "./queries.js";
import { EmailCredentials, SendEmail, SendTestEmail } from "./validator.js";
export const setEmailCredsService = async (
  input: EmailCredentials & { userId: number },
) => {
  try {
    if (input.provider === emailProviders.SMTP) {
      const [existingSmtp] = await db
        .select()
        .from(smtpEmailCreds)
        .where(eq(smtpEmailCreds.userId, input.userId));

      const dbPayload = {
        userId: input.userId,
        email: input.creds.email,
        passKey: encrypt(input.creds.passKey),
        name: input.creds.name,
        username: input.creds.username,
        host: input.creds.host,
        port: input.creds.port,
        secure: input.creds.secure,
        status: true,
      };

      if (existingSmtp) {
        await db
          .update(smtpEmailCreds)
          .set(dbPayload)
          .where(
            eq(smtpEmailCreds.smtpEmailCredsId, existingSmtp.smtpEmailCredsId),
          );
      } else {
        await db.insert(smtpEmailCreds).values(dbPayload);
      }

      await db
        .update(sendgridEmailCreds)
        .set({ status: false })
        .where(eq(sendgridEmailCreds.userId, input.userId));
    } else if (input.provider === emailProviders.SENDGRID) {
      const [existingSendgrid] = await db
        .select()
        .from(sendgridEmailCreds)
        .where(eq(sendgridEmailCreds.userId, input.userId));

      const dbPayload = {
        userId: input.userId,
        apiKey: encrypt(input.creds.apiKey),
        email: input.creds.email,
        name: input.creds.name,
        status: true,
      };

      if (existingSendgrid) {
        await db
          .update(sendgridEmailCreds)
          .set(dbPayload)
          .where(
            eq(
              sendgridEmailCreds.sendgridEmailCredsId,
              existingSendgrid.sendgridEmailCredsId,
            ),
          );
      } else {
        await db.insert(sendgridEmailCreds).values(dbPayload);
      }

      await db
        .update(smtpEmailCreds)
        .set({ status: false })
        .where(eq(smtpEmailCreds.userId, input.userId));
    }
  } catch (error) {
    throw error;
  }
};

const validateAndReplaceVariables = (
  html: string,
  subject: string,
  inputVariables: {
    variableName: string;
    variableValue: string;
  }[],
  templateVariables: {
    variableName: string;
    isRequired: boolean;
    templateId: string;
    defaultValue: string | null;
  }[],
) => {
  const allRequiredVariables = templateVariables.filter(
    (variable) => variable.isRequired,
  );

  if (
    allRequiredVariables.length > 0 &&
    allRequiredVariables.some(
      (variable) =>
        !inputVariables.find((v) => v.variableName === variable.variableName),
    )
  ) {
    throw new CustomError("All required variables are not provided", 400);
  }

  let updatedHtml = html;
  let updatedSubject = subject;

  ///replace variables value in html {{variableName}}
  allRequiredVariables.forEach((variable) => {
    const variableValue = inputVariables.find(
      (v) => v.variableName === variable.variableName,
    )?.variableValue;
    if (!variableValue)
      throw new CustomError("All required variables are not provided", 400);
    updatedHtml = updatedHtml.replace(
      `{{${variable.variableName}}}`,
      variableValue,
    );
  });

  // replace in subject
  allRequiredVariables.forEach((variable) => {
    const variableValue = inputVariables.find(
      (v) => v.variableName === variable.variableName,
    )?.variableValue;
    if (!variableValue)
      throw new CustomError("All required variables are not provided", 400);
    updatedSubject = updatedSubject.replace(
      `{{${variable.variableName}}}`,
      variableValue,
    );
  });

  return {
    html: updatedHtml,
    subject: updatedSubject,
  };
};

export const getEmailCredsService = async (input: {
  userId: number;
  provider: string;
}) => {
  const [emailCreds] =
    input.provider === emailProviders.SMTP
      ? await getSmtpEmailCredsQuery({ userId: input.userId })
      : await getSendgridEmailCredsQuery({ userId: input.userId });
  if (!emailCreds) return null;
  return { creds: emailCreds, provider: input.provider };
};
export const sendEmailService = async (
  input: SendEmail & { userId: number },
) => {
  try {
    const { templateId, scheduleAt } = input;

    // get email creds
    const emailCreds = await getEmailCredsService({
      userId: input.userId,
      provider: input.provider,
    });

    if (!emailCreds) {
      throw new CustomError("Email credentials not found", 400);
    }
    // get template
    const [template] = await getEmailTemplatesQuery({
      templateIds: [templateId],
    });

    if (!template) {
      throw new CustomError("Template not found", 400);
    }

    // get variables
    const variables = await getEmailTemplateVariablesQuery({
      templateIds: [templateId],
    });

    // validate
    const { html, subject } = validateAndReplaceVariables(
      template.html,
      template.subject,
      input.variables,
      variables,
    );

    const delayMs = scheduleAt ? scheduleAt.getTime() - Date.now() : 0;

    await db.transaction(async (trx) => {
      for (const recipient of input.recipients) {
        const insertResult = await insertEmailsQuery(
          [
            {
              toEmail: recipient,
              templateId: template.templateId,
              subject: subject,
              body: html,
              emailStatus: emailStatus.PENDING,
              userId: input.userId,
              provider: emailCreds.provider,
              scheduledAt: scheduleAt,
            },
          ],
          trx,
        );
        const emailId =
          (await insertResult.length) > 0 ? insertResult[0]?.insertId : null;

        if (!emailId)
          throw new CustomError(
            "Something went wrong while inserting email",
            400,
          );
        await addEmailJob(
          {
            provider: emailCreds.provider,
            creds: emailCreds.creds,
            emailData: {
              emailId,
              templateId: template.templateId,
              to: recipient,
              subject: subject,
              html,
            },
          } as EmailJobData,
          "email-queue",
          {
            delay: delayMs,
          },
        );
      }
    });
  } catch (error) {
    throw error;
  }
};

export const sendTestEmailService = async (
  input: SendTestEmail & { userId: number },
) => {
  try {
    let slug;
    if (input.provider === emailProviders.SMTP) {
      slug = slugs.smtpTestEmail;
    } else if (input.provider === emailProviders.SENDGRID) {
      slug = slugs.sendgridTestEmail;
    }
    if (!slug) return;
    const [testTemplate] = await getEmailTemplatesQuery({
      slugs: [slug],
    });

    if (!testTemplate) {
      throw new CustomError("Template not found", 400);
    }

    const emailCreds = await getEmailCredsService({
      provider: input.provider,
      userId: input.userId,
    });

    if (!emailCreds) {
      throw new CustomError("Email credentials not found", 400);
    }
    const recipient =
      input.provider === emailProviders.SMTP
        ? emailCreds?.creds.email
        : emailCreds?.creds.email;
    const senderName =
      input.provider === emailProviders.SMTP
        ? emailCreds?.creds.name
        : emailCreds?.creds.name || "User";

    const variables = [
      {
        variableName: "name",
        variableValue: senderName,
      },
      {
        variableName: "platformName",
        variableValue: "Notivo",
      },
      {
        variableName: "timestamp",
        variableValue: getCurrentIndianDate().format(
          "ddd MMM DD YYYY HH:mm:ss [GMT]ZZ",
        ),
      },
    ];
    const templateVariables = await getEmailTemplateVariablesQuery({
      templateIds: [testTemplate.templateId],
    });

    const { html, subject } = validateAndReplaceVariables(
      testTemplate.html,
      testTemplate.subject,
      variables,
      templateVariables,
    );

    // console.log("---email creds---", {
    //   apiKey: dcrypt((emailCreds?.creds as any).apiKey),
    //   email: (emailCreds?.creds as any).email,
    //   name: (emailCreds?.creds as any).name,
    // });

    // return;
    await db.transaction(async (trx) => {
      for (const toEmail of [recipient]) {
        const insertResult = await insertEmailsQuery(
          [
            {
              toEmail: toEmail,
              templateId: testTemplate.templateId,
              subject: subject,
              body: html,
              emailStatus: emailStatus.PENDING,
              userId: input.userId,
              provider: input.provider,
            },
          ],
          trx,
        );
        const emailId =
          (await insertResult.length) > 0 ? insertResult[0]?.insertId : null;

        if (!emailId)
          throw new CustomError(
            "Something went wrong while inserting email",
            400,
          );

        const emailData = {
          emailId,
          templateId: testTemplate.templateId,
          to: toEmail,
          subject: subject,
          html,
        };

        if (input.provider === emailProviders.SMTP) {
          await addEmailJob({
            provider: emailProviders.SMTP,
            creds: {
              email: (emailCreds?.creds as any).email,
              passKey: (emailCreds?.creds as any).passKey,
              name: (emailCreds?.creds as any).name,
              host: (emailCreds?.creds as any).host,
              port: (emailCreds?.creds as any).port,
              secure: (emailCreds?.creds as any).secure,
              username: (emailCreds?.creds as any).username,
            },
            emailData,
          });
        } else {
          await addEmailJob({
            provider: emailProviders.SENDGRID,
            creds: {
              apiKey: (emailCreds?.creds as any).apiKey,
              email: (emailCreds?.creds as any).email,
              name: (emailCreds?.creds as any).name,
            },
            emailData,
          });
        }
      }
    });
  } catch (error) {
    throw error;
  }
};

export const getEmailDetailsService = async (input: {
  emailId: number;
  userId: number;
}) => {
  try {
    // Get email — ensure it belongs to this user
    const [email] = await getAllEmailsQuery({
      userId: input.userId,
      emailId: input.emailId,
    });

    if (!email) {
      return null;
    }

    // Get all attempts for this email ordered by attempt number
    const attempts = await getEmailAttemptsQuery({ emailId: email.emailId });

    // Calculate delivery time if delivered
    const deliveryTimeMs =
      email.deliveredAt && email.createdAt
        ? dayjs(email.deliveredAt).valueOf() - dayjs(email.createdAt).valueOf()
        : null;

    return {
      email,
      attempts,
      meta: {
        totalAttempts: attempts.length,
        deliveryTimeMs,
        deliveryTimeSeconds: deliveryTimeMs
          ? (deliveryTimeMs / 1000).toFixed(2)
          : null,
      },
    };
  } catch (error) {
    throw error;
  }
};
