import { validateRequestBody } from "@/utils/zod-helpers";
import { SignupRequestBodySchema } from "./validator";

export const validateSignupRequestBody = validateRequestBody(
  SignupRequestBodySchema,
);
