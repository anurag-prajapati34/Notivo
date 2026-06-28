import { validateRequestBody } from "@/utils/zod-helpers";
import {
  EmailCredentialsSchema,
  SendEmailSchema,
  SendTestEmailSchema,
} from "./validator";

export const validateEmailCredsRequestBody = validateRequestBody(
  EmailCredentialsSchema,
);
export const validateSendEmailRequestBody =
  validateRequestBody(SendEmailSchema);
export const validateSendTestEmailRequestBody =
  validateRequestBody(SendTestEmailSchema);
