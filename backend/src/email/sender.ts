import { dcrypt } from "@/utils/encryption.js";
import { emailProviders } from "@/utils/enum.js";
import { logger } from "@/utils/logger.js";
import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";
import {
  EmailJobData,
  EmailResult,
  SendGridJobEnvelope,
  SmtpJobEnvelope,
} from "./types.js";

/**
 * Creates and configures a production-ready Nodemailer transporter.
 * Forces IPv4 network routing to prevent cloud container ENETUNREACH errors.
 * * @param {SmtpJobEnvelope["creds"]} creds - Standard credentials object payload
 * @returns {Promise<nodemailer.Transporter>} Configured transport engine
 */
const createTransporter = async (creds: SmtpJobEnvelope["creds"]) => {
  const smtpPort = Number(creds.port); // Force clean integer casting to prevent string append bugs

  const transporter = nodemailer.createTransport({
    host: creds.host,
    port: smtpPort,
    secure: creds.secure,

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
 * Send a single email using SMTP transporter
 */
export const sendEmail = async (
  options: SmtpJobEnvelope,
): Promise<EmailResult> => {
  const { creds, emailData } = options;
  try {
    const transporter = await createTransporter({
      ...creds,
      passKey: dcrypt(creds.passKey),
    });

    const mailOptions = {
      from: {
        name: creds.name,
        address: creds.email,
      },
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

    logger.error("Failed to send email via SMTP", {
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

/**
 * Send an email using SendGrid
 */
export const sendEmailUsingSendGrid = async (
  options: SendGridJobEnvelope,
): Promise<EmailResult> => {
  const { creds, emailData } = options;

  try {
    const SEND_GRID_API_KEY = dcrypt(creds.apiKey);
    if (!SEND_GRID_API_KEY) {
      throw new Error("SendGrid API key is missing");
    }
    sgMail.setApiKey(SEND_GRID_API_KEY);

    await sgMail.send({
      from: creds.email,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    });

    return {
      success: true,
      messageId: "",
      recipient: Array.isArray(emailData.to)
        ? emailData.to.join(", ")
        : emailData.to,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: errorMessage,
      recipient: Array.isArray(emailData.to)
        ? emailData.to.join(", ")
        : emailData.to,
    };
  }
};

/**
 * Entry point for background workers. Routes job to correct delivery driver based on provider type.
 */
export const sendUserEmail = async (
  jobData: EmailJobData,
): Promise<EmailResult> => {
  switch (jobData.provider) {
    case emailProviders.SMTP:
      return await sendEmail(jobData);
    case emailProviders.SENDGRID:
      return await sendEmailUsingSendGrid(jobData);
    default:
      throw new Error(
        `Unsupported email provider type: ${(jobData as any).provider}`,
      );
  }
};
