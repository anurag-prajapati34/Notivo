import {
  validateRequestBody,
  validateRequestQuery,
} from "@/utils/zod-helpers.js";
import {
  EmailCredentialsSchema,
  getEmailCredsQuerySchema,
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
export const validateGetEmailCredsQuery = validateRequestQuery(
  getEmailCredsQuerySchema,
);
