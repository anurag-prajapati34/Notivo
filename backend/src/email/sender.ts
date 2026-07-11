import { config } from "@/config/index.js";
import { logger } from "@/utils/logger.js";
import nodemailer from "nodemailer";
import {
  EmailCreds,
  EmailJobData,
  EmailOptions,
  EmailResult,
} from "./types.js";

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
/**
 * Creates and configures a production-ready Nodemailer transporter.
 * Forces IPv4 network routing to prevent cloud container ENETUNREACH errors.
 * * @param {EmailCreds} creds - Standard credentials object payload
 * @returns {Promise<nodemailer.Transporter>} Configured transport engine
 */
const createTransporter = async (creds: EmailCreds) => {
  const smtpPort = Number(creds.port); // Force clean integer casting to prevent string append bugs

  const transporter = nodemailer.createTransport({
    host: creds.host,
    port: smtpPort,

    // ⚠️ THE PORT-TLS BALANCE RULE:
    // Port 465 requires secure: true (Implicit TLS).
    // Port 587 requires secure: false (Explicit STARTTLS).
    // This auto-evaluates to true only if port 465 is used, preventing handshake hangs.
    secure: smtpPort === 465,

    auth: {
      user: creds.username,
      pass: creds.passKey, // Ensure your 16-character App Password has no spaces
    },

    // ⏳ AGGRESSIVE NETWORK TIMEOUT SAFEGUARDS:
    connectionTimeout: 15000, // 15 seconds connection attempt window
    greetingTimeout: 15000, // 15 seconds SMTP greeting threshold
    socketTimeout: 20000, // 20 seconds idle activity threshold
    dnsTimeout: 5000,

    // ⚠️ CRUCIAL INFRASTRUCTURE INNER BYPASS WRAPPER:
    connectionOptions: {
      family: 4, // Directs Node's DNS resolver to strictly prioritize IPv4 routes (Bypasses IPv6)
    },

    tls: {
      rejectUnauthorized: false, // Prevents cloud container handshake drops due to self-signed certs
      ciphers: "SSLv3", // Force legacy/modern translation compatibility with Gmail relays
    },
  } as any);

  // Verifies the SMTP handshake completely before returning the transport instance
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
    logger.error("Send email error", error);
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
