import { config } from "@/config";
import { updateEmailQuery } from "@/routes/v1/email/queries";
import { emailStatus } from "@/utils/enum";
import { logger } from "@/utils/logger";
import nodemailer from "nodemailer";
import { EmailCreds, EmailJobData, EmailOptions, EmailResult } from "./types";

const getEmailConfig = () => {
  const { host, auth, port, secure } = config.email;
  if (!host || !auth || !port) {
    throw new Error("Email configuration is missing");
  }
  return { host, auth, from: config.email.from, port, secure };
};

/**
 * Create nodemailer transporter
 *
 * @description
 * Creates and configures a nodemailer transporter using the application's
 * email configuration. Handles both authenticated and non-authenticated SMTP.
 *
 * @returns Configured nodemailer transporter
 * @throws Error if email configuration is invalid
 *
 * @example
 * ```typescript
 * const transporter = await createTransporter()
 * await transporter.sendMail(mailOptions)
 * ```
 */
const createTransporter = async (creds: EmailCreds) => {
  const transporter = nodemailer.createTransport({
    host: creds.host,
    port: creds.port,
    secure: creds.secure,
    auth: {
      user: creds.username,
      pass: creds.passKey,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  await transporter.verify();

  return transporter;
};

/**
 * Send a single email
 *
 * @description
 * Sends an email using the configured SMTP settings. Supports both HTML
 * and text email formats with proper error handling.
 *
 * @param options - Email sending options including recipient, subject, and content
 * @returns Promise resolving to EmailResult with success status and details
 *
 * @example
 * ```typescript
 * const result = await sendEmail({
 *   to: 'user@example.com',
 *   subject: 'Welcome to Strata',
 *   html: '<h1>Welcome!</h1>',
 *   text: 'Welcome!'
 * })
 * ```
 */
export const sendEmail = async (
  options: EmailOptions,
): Promise<EmailResult> => {
  const { emailCreds, emailData } = options;
  try {
    const transporter = await createTransporter(emailCreds);
    // const emailConfig = await getEmailConfig();

    const mailOptions = {
      from: emailCreds.email,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      attachments: emailData.attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      recipient: Array.isArray(emailData.to)
        ? emailData.to.join(", ")
        : emailData.to,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logger.error("Failed to send email", {
      error: errorMessage,
      to: emailData.to,
      subject: emailData.subject,
    });

    return {
      success: false,
      error: errorMessage,
      recipient: Array.isArray(emailData.to)
        ? emailData.to.join(", ")
        : emailData.to,
    };
  }
};

export const sendUserEmail = async (jobData: EmailJobData) => {
  const { emailCreds, emailData } = jobData;
  // const template=await getEmailTemplate(jobData.templateId);
  const result = await sendEmail({
    emailCreds,
    emailData,
  });

  return result;
};
