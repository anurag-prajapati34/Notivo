import { emailSchema } from "@/utils/zod-helpers";
import z from "zod";

export const EmailCredentialsSchema = z.object({
  email: emailSchema("Email"),
  passKey: z.string(),
});
export type EmailCredentials = z.infer<typeof EmailCredentialsSchema>;
