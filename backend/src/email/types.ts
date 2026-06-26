/**
 * Email sending options interface
 */
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
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
  emailId: number;
  templateId: string;
  to: string | string[];
  subject: string;
  from?: string;
  fromName?: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    path: string;
  }>;
}
