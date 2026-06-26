import { validateRequestBody } from "@/utils/zod-helpers";
import { EmailCredentialsSchema, SendEmailSchema } from "./validator";

export const validateEmailCredsRequestBody = validateRequestBody(
  EmailCredentialsSchema,
);
export const validateSendEmailRequestBody =
  validateRequestBody(SendEmailSchema);
