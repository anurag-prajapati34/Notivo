import {
  emailSchema,
  mobileSchema,
  passwordSchema,
  stringSchema,
  stringSchemaOptional,
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
