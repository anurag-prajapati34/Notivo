import { validateRequestBody } from "@/utils/zod-helpers.js";
import {
  LoginRequestBodySchema,
  SignupRequestBodySchema,
} from "./validator.js";

export const validateSignupRequestBody = validateRequestBody(
  SignupRequestBodySchema,
);
export const validateLoginRequestBody = validateRequestBody(
  LoginRequestBodySchema,
);
