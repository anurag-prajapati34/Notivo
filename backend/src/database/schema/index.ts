/**
 * This file exports all the tables and types from the schema
 */
export * from "./users.js";
export * from "./emails.js";
export * from "./email-creds.js";
export * from "./email-templates.js";
export * from "./email-template-variables.js";
export type { User, NewUser } from "./users.js";
export type { Email, NewEmail } from "./emails.js";
export type { EmailCreds, NewEmailCreds } from "./email-creds.js";
export type { EmailTemplate, NewEmailTemplate } from "./email-templates.js";
export type {
  EmailTemplateVariable,
  NewEmailTemplateVariable,
} from "./email-template-variables.js";
