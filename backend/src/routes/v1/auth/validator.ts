import {
  emailSchema,
  mobileSchema,
  passwordSchema,
  stringSchema,
} from "@/utils/zod-helpers";
import z from "zod";

export const SignupRequestBodySchema = z.object({
  firstName: stringSchema("First Name", 2, 50),
  lastName: stringSchema("Last Name", 2, 50).optional(),
  email: emailSchema(),
  mobile: mobileSchema(),
  dialCode: stringSchema("Dial Code", 1, 5),
  password: passwordSchema("Password"),
});

export type SignupRequestBodyType = z.infer<typeof SignupRequestBodySchema>;

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
