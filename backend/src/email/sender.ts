import { config } from "@/config";
import { logger } from "@/utils/logger";
import nodemailer from "nodemailer";
import { EmailJobData, EmailOptions, EmailResult } from "./types";
import { template } from "./templates/test";
import { updateEmailQuery } from "@/routes/v1/email/queries";
import { emailStatus } from "@/utils/enum";

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
const createTransporter = async () => {
  const { host, auth, port, secure } = getEmailConfig();
  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: secure,
    auth: auth,
    tls: {
      rejectUnauthorized: false,
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
  try {
    const transporter = await createTransporter();
    const emailConfig = await getEmailConfig();

    const mailOptions = {
      from: options.from || emailConfig.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      recipient: Array.isArray(options.to) ? options.to.join(", ") : options.to,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logger.error("Failed to send email", {
      error: errorMessage,
      to: options.to,
      subject: options.subject,
    });

    return {
      success: false,
      error: errorMessage,
      recipient: Array.isArray(options.to) ? options.to.join(", ") : options.to,
    };
  }
};

export const sendUserEmail = async (jobData: EmailJobData) => {
  // const template=await getEmailTemplate(jobData.templateId);
  const result = await sendEmail({
    to: jobData.to,
    subject: jobData.subject,
    html: template,
  });
  if (result.success) {
    await updateEmailQuery(jobData.emailId, {
      emailStatus: emailStatus.SENT,
      updatedAt: new Date(),
    });
  } else {
    await updateEmailQuery(jobData.emailId, {
      emailStatus: emailStatus.FAILED,
      updatedAt: new Date(),
      lastErrorMessage: result.error,
    });
  }
  return result;
};
