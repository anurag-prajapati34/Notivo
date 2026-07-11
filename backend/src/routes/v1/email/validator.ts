import {
  emailSchema,
  numberSchema,
  stringSchema,
} from "@/utils/zod-helpers.js";
import z from "zod";
import { emailProviders } from "@/utils/enum.js";

export const SmptCredsSchema = z.object({
  email: emailSchema("Email"),
  passKey: stringSchema("Pass Key"),
  username: stringSchema("Username"),
  name: stringSchema("Name"),
  host: stringSchema("Host"),
  port: numberSchema("Port"),
  secure: z.boolean().default(false),
});
export type SmptCreds = z.infer<typeof SmptCredsSchema>;

export const SendGridCredsSchema = z.object({
  email: emailSchema("Email"),
  name: stringSchema("Name"),
  apiKey: stringSchema("Api Key"),
});

export const EmailCredentialsSchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal(emailProviders.SMTP),
    creds: SmptCredsSchema,
  }),
  z.object({
    provider: z.literal(emailProviders.SENDGRID),
    creds: SendGridCredsSchema,
  }),
]);
export type EmailCredentials = z.infer<typeof EmailCredentialsSchema>;

export const SendEmailSchema = z.object({
  provider: z
    .enum([emailProviders.SMTP, emailProviders.SENDGRID])
    .default(emailProviders.SENDGRID),
  templateId: stringSchema("Template Id", 1),
  recipients: z.array(emailSchema("Email")).min(1),
  variables: z.array(
    z.object({
      variableName: z.string(),
      variableValue: z.string(),
    }),
  ),
});
export type SendEmail = z.infer<typeof SendEmailSchema>;

export type SendGridCreds = z.infer<typeof SendGridCredsSchema>;

export const SendTestEmailSchema = z.discriminatedUnion("provider", [
  z.object({
    provider: z.literal(emailProviders.SMTP),
    creds: SmptCredsSchema,
  }),
  z.object({
    provider: z.literal(emailProviders.SENDGRID),
    creds: SendGridCredsSchema,
  }),
]);

export type SendTestEmail = z.infer<typeof SendTestEmailSchema>;

export const getEmailCredsQuerySchema = z.object({
  provider: z
    .enum([emailProviders.SMTP, emailProviders.SENDGRID])
    .default(emailProviders.SENDGRID),
});
export type GetEmailCredsQuery = z.infer<typeof getEmailCredsQuerySchema>;
