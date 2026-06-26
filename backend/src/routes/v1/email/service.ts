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
import { EmailCredentials, SendEmail } from "./validator";
import { db } from "@/database/connection";

export const setEmailCredsService = async (
  input: EmailCredentials & { userId: number },
) => {
  try {
    const [emailCreds] = await getEmailCredsQuery({
      email: input.email,
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

export const sendEmailService = async (
  input: SendEmail & { userId: number },
) => {
  try {
    const { templateId } = input;
    const [template] = await getEmailTemplatesQuery({
      templateIds: [templateId],
    });

    if (!template) {
      throw new Error("Template not found");
    }
    const variables = await getEmailTemplateVariablesQuery({
      templateIds: [templateId],
    });

    const allRequiredVariables = variables.filter(
      (variable) => variable.isRequired,
    );

    if (
      allRequiredVariables.length > 0 &&
      allRequiredVariables.some(
        (variable) =>
          !input.variables.find(
            (v) => v.variableName === variable.variableName,
          ),
      )
    ) {
      throw new Error("All required variables are not provided");
    }

    let html = template.html;
    let subject = template.subject;

    ///replace variables value in html {{variableName}}
    allRequiredVariables.forEach((variable) => {
      const variableValue = input.variables.find(
        (v) => v.variableName === variable.variableName,
      )?.variableValue;
      if (!variableValue)
        throw new Error("All required variables are not provided");
      html = html.replace(`{{${variable.variableName}}}`, variableValue);
    });

    // replace in subject
    allRequiredVariables.forEach((variable) => {
      const variableValue = input.variables.find(
        (v) => v.variableName === variable.variableName,
      )?.variableValue;
      if (!variableValue)
        throw new Error("All required variables are not provided");
      subject = subject.replace(`{{${variable.variableName}}}`, variableValue);
    });

    console.log("updated email", {
      html,
      subject,
    });

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
          emailId,
          templateId: template.templateId,
          to: recipient,
          subject: subject,
          html,
        });
      }
    });
  } catch (error) {
    throw error;
  }
};
