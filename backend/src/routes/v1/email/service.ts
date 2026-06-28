import { addEmailJob } from "@/jobs/email-queue";
import { emailStatus } from "@/utils/enum";
import {
  getEmailCredsQuery,
  getEmailTemplatesQuery,
  getEmailTemplateVariablesQuery,
  insertEmailCredsQuery,
  insertEmailsQuery,
  updateEmailCredsQuery,
} from "./queries";
import { EmailCredentials, SendEmail, SendTestEmail } from "./validator";
import { db } from "@/database/connection";
import { slugs } from "@/database/seed/email-templates";
import { template } from "@/email/templates/test";

export const setEmailCredsService = async (
  input: EmailCredentials & { userId: number },
) => {
  try {
    const [emailCreds] = await getEmailCredsQuery({
      // email: input.email,
      userId: input.userId,
    });

    if (emailCreds) {
      await updateEmailCredsQuery(emailCreds.emailCredsId, {
        ...input,
      });
    } else {
      await insertEmailCredsQuery(input);
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
    throw new Error("All required variables are not provided");
  }

  let updatedHtml = html;
  let updatedSubject = subject;

  ///replace variables value in html {{variableName}}
  allRequiredVariables.forEach((variable) => {
    const variableValue = inputVariables.find(
      (v) => v.variableName === variable.variableName,
    )?.variableValue;
    if (!variableValue)
      throw new Error("All required variables are not provided");
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
      throw new Error("All required variables are not provided");
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
export const sendEmailService = async (
  input: SendEmail & { userId: number },
) => {
  try {
    const { templateId } = input;

    const [emailCreds] = await getEmailCredsQuery({ userId: input.userId });

    if (!emailCreds) {
      throw new Error("Email credentials not found");
    }
    const [template] = await getEmailTemplatesQuery({
      templateIds: [templateId],
    });

    if (!template) {
      throw new Error("Template not found");
    }
    const variables = await getEmailTemplateVariablesQuery({
      templateIds: [templateId],
    });

    const { html, subject } = validateAndReplaceVariables(
      template.html,
      template.subject,
      input.variables,
      variables,
    );

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
            },
          ],
          trx,
        );
        const emailId =
          (await insertResult.length) > 0 ? insertResult[0]?.insertId : null;

        if (!emailId)
          throw new Error("Something went wrong while inserting email");
        await addEmailJob({
          emailCreds,
          emailData: {
            emailId,
            templateId: template.templateId,
            to: recipient,
            subject: subject,
            html,
          },
        });
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
    const [testTemplate] = await getEmailTemplatesQuery({
      slugs: [slugs.smtpTestEmail],
    });

    if (!testTemplate) {
      throw new Error("Template not found");
    }

    const variables = [
      {
        variableName: "name",
        variableValue: input.name,
      },
      {
        variableName: "platformName",
        variableValue: "Notivo",
      },
      {
        variableName: "timestamp",
        variableValue: new Date().toString(),
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

    console.log("before updated0---------", {
      html: testTemplate.html,
      subject: testTemplate.subject,
    });
    console.log("updated0---------", { html, subject });
    await db.transaction(async (trx) => {
      for (const recipient of [input.email]) {
        const insertResult = await insertEmailsQuery(
          [
            {
              toEmail: recipient,
              templateId: testTemplate.templateId,
              subject: subject,
              body: html,
              emailStatus: emailStatus.PENDING,
              userId: input.userId,
            },
          ],
          trx,
        );
        const emailId =
          (await insertResult.length) > 0 ? insertResult[0]?.insertId : null;

        if (!emailId)
          throw new Error("Something went wrong while inserting email");
        await addEmailJob({
          emailCreds: {
            email: input.email,
            passKey: input.passKey,
            name: input.name,
            host: input.host,
            port: input.port,
            secure: input.secure,
            username: input.username,
          },
          emailData: {
            emailId,
            templateId: testTemplate.templateId,
            to: recipient,
            subject: subject,
            html,
          },
        });
      }
    });
  } catch (error) {
    throw error;
  }
};
