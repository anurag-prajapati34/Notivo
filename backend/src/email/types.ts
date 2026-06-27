export interface EmailCreds {
  email: string;
  passKey: string;
  username: string;
  name: string;
  host: string;
  port: number;
  secure: boolean;
}
/**
 * Email sending options interface
 */
export interface EmailOptions {
  emailCreds: EmailCreds;
  emailData: {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{
      filename: string;
      path: string;
    }>;
  };
}

/**
 * Email sending result interface
 */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  recipient: string;
}

export interface EmailJobData {
  emailCreds: EmailCreds;
  emailData: {
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
  };
}
