export interface User {
  firstName: string;
  lastName: string;
  email: string;
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

export interface EmailCreds {
  email: string;
  passKey: string;
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
  sentAt: string | null;
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
  recentEmails: {
    emailId: number;
    toEmail: string;
    subject: string;
    emailStatus: string;
    templateName: string;
    date: string;
  }[];
}
