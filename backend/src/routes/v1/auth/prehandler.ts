import { validateRequestBody } from "@/utils/zod-helpers";
import { LoginRequestBodySchema, SignupRequestBodySchema } from "./validator";

export const validateSignupRequestBody = validateRequestBody(
  SignupRequestBodySchema,
);
export const validateLoginRequestBody = validateRequestBody(
  LoginRequestBodySchema,
);
