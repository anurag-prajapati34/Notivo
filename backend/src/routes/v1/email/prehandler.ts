import { validateRequestBody } from "@/utils/zod-helpers.js";
import {
  EmailCredentialsSchema,
  SendEmailSchema,
  SendTestEmailSchema,
} from "./validator.js";

export const validateEmailCredsRequestBody = validateRequestBody(
  EmailCredentialsSchema,
);
export const validateSendEmailRequestBody =
  validateRequestBody(SendEmailSchema);
export const validateSendTestEmailRequestBody =
  validateRequestBody(SendTestEmailSchema);
