/**
 * This file exports all the tables and types from the schema
 */
export * from "./users.js";
export * from "./emails.js";
export * from "./smtp-email-creds.js";
export * from "./sendgrid-email-creds.js";
export * from "./email-templates.js";
export * from "./email-template-variables.js";
export * from "./email-attempts.js";
export type { User, NewUser } from "./users.js";
export type { Email, NewEmail } from "./emails.js";
export type { SmtpEmailCreds, NewSmtpEmailCreds } from "./smtp-email-creds.js";
export type {
  SendgridEmailCreds,
  NewSendgridEmailCreds,
} from "./sendgrid-email-creds.js";
export type { EmailTemplate, NewEmailTemplate } from "./email-templates.js";
export type {
  EmailTemplateVariable,
  NewEmailTemplateVariable,
} from "./email-template-variables.js";
export type { EmailAttempt, NewEmailAttempt } from "./email-attempts.js";
