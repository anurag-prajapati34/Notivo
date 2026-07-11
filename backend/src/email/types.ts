import { emailProviders } from "@/utils/enum.js";
//Uniform mail payload
export interface MailPayload {
  emailId: number;
  templateId: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}

// SMTP Provider
type Smtp = typeof emailProviders.SMTP;
export interface SmtpJobEnvelope {
  provider: Smtp;
  creds: {
    host: string;
    port: number;
    username: string;
    passKey: string;
    secure: boolean;
    name: string;
    email: string;
  };
  emailData: MailPayload;
}

//SendGrid Provider
type SendGrid = typeof emailProviders.SENDGRID;
export interface SendGridJobEnvelope {
  provider: SendGrid;
  creds: {
    apiKey: string;
    email: string;
    name: string;
  };
  emailData: MailPayload;
}

//Uniform job envelope
export type EmailJobData = SmtpJobEnvelope | SendGridJobEnvelope;

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  recipient: string;
}
