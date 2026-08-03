import type { emailProviders } from "../utils/enum";

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  userType?: string | null;
}
export interface Login {
  email: string;
  password: string;
}

export interface Signup {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobile: string;
}

export interface LoginResponseType {
  token: string;
}

export interface ApiResponseType<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface EmailTemplateVariable {
  variableName: string;
  isRequired: boolean;
  templateId: string;
  defaultValue: string | null;
}

export interface EmailTemplate {
  templateId: string;
  name: string;
  subject: string;
  slug: string;
  html: string;
  description: string;
  userId: number;
  variables: EmailTemplateVariable[];
}

export interface Email {
  templateId: string;
  toEmail: string | null;
  subject: string;
  body: string | null;
  emailStatus: "SENT" | "FAILED" | "PENDING";
  attempts: number;
  lastErrorMessage: string | null;
  queuedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  emailId: number;
  scheduledAt: string | null;
}

export interface AnalyticsStats {
  overview: {
    total: number;
    delivered: number;
    failed: number;
    pending: number;
  };
  last7Days: {
    date: string;
    total: number;
    failed: number;
    delivered: number;
  }[];
  templateUsage: {
    templateName: string;
    count: number;
  }[];
  recentEmails: Email[];
}

export interface SmtpForm {
  fromName: string;
  fromEmail: string;
  host: string;
  port: number;
  username: string;
  passKey: string;
}

export interface EmailAttempt {
  attemptId: number;
  emailId: number;
  attemptNumber: number;
  emailStatus: string;
  errorMessage: string | null;
  attemptedAt: string;
}

export interface EmailDetailMeta {
  totalAttempts: number;
  deliveryTimeMs: number | null;
  deliveryTimeSeconds: string | null;
}

export interface EmailDetail {
  email: Email;
  attempts: EmailAttempt[];
  meta: EmailDetailMeta;
}

export interface SendEmail {
  templateId: string;
  recipients: string[];
  scheduleAt?: Date | string;
  variables: {
    variableName: string;
    variableValue: string;
  }[];
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
}

//Uniform job envelope
export type EmailCreds = SmtpJobEnvelope | SendGridJobEnvelope;
