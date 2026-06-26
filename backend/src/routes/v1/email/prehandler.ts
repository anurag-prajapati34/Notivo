import { validateRequestBody } from "@/utils/zod-helpers";
import { EmailCredentialsSchema } from "./validator";

export const validateEmailCredsRequestBody = validateRequestBody(
  EmailCredentialsSchema,
);
