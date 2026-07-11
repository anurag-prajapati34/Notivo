export const emailProviders = {
  SMTP: "SMTP",
  SENDGRID: "SENDGRID",
  RESEND: "RESEND",
} as const;
export type EmailProvider =
  (typeof emailProviders)[keyof typeof emailProviders];
export const EmailProviderEnum = Object.values(emailProviders);
