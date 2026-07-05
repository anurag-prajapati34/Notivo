import { UserTypeEnum, userTypes } from "@/utils/enum";
import {
  emailSchema,
  mobileSchema,
  passwordSchema,
  stringSchema,
} from "@/utils/zod-helpers.js";
import z from "zod";

/**
 * Schema to validate user signup request body.
 * @type {z.ZodSchema<SignupRequestBodyType>}
 */
export const SignupRequestBodySchema = z.object({
  userType: z.enum(UserTypeEnum).default(userTypes.USER),
  firstName: stringSchema("First Name", 2, 50),
  lastName: stringSchema("Last Name", 2, 50).optional(),
  email: emailSchema(),
  mobile: mobileSchema(),
  dialCode: stringSchema("Dial Code", 1, 5),
  password: passwordSchema("Password"),
});
export type SignupRequestBodyType = z.infer<typeof SignupRequestBodySchema>;

/**
 * Schema to validate user login request body.
 * @type {z.ZodSchema<LoginRequestBodyType>}
 */
export const LoginRequestBodySchema = z
  .object({
    email: emailSchema().optional(),
    mobile: mobileSchema().optional(),
    password: passwordSchema("Password"),
  })
  .refine(
    (data) => {
      return data.mobile || data.email;
    },
    {
      message: "Either email or mobile is required",
      path: ["email", "mobile"],
    },
  );

export type LoginRequestBodyType = z.infer<typeof LoginRequestBodySchema>;
