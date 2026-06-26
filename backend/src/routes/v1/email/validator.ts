import { emailSchema, stringSchema } from "@/utils/zod-helpers";
import z from "zod";

export const EmailCredentialsSchema = z.object({
  email: emailSchema("Email"),
  passKey: z.string(),
});
export type EmailCredentials = z.infer<typeof EmailCredentialsSchema>;

export const SendEmailSchema = z.object({
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
