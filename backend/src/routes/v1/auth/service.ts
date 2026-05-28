import { generateJwtAuthToken } from "@/utils/jwt-helpers";
import bcrypt from "bcryptjs";
import {
  getUserQuery,
  insertUsersQuery,
  isUserExistsWithEmailQuery,
  isUserExistsWithMobileQuery,
} from "./queries";
import { LoginRequestBodyType, SignupRequestBodyType } from "./validator";

/**
 * Business logic service to handle new user registration.
 * Validates unique constraints (email and mobile), hashes the password via encryption,
 * and inserts the record into the database.
 * * @param {SignupRequestBodyType} input - The validated user signup payload.
 * @param {string} [input.email] - Optional email address of the user.
 * @param {string} [input.mobile] - Optional mobile number of the user.
 * @param {string} input.firstName - First name of the user.
 * @param {string} [input.lastName] - Optional last name of the user.
 * @param {string} input.dialCode - Country dial code for the mobile number.
 * @param {string} input.password - The plain text password to be encrypted.
 * * @returns {Promise<{ userId: string | number }>} A promise resolving to an object containing the newly created `userId`.
 * * @throws {Error} Throws an error if the email already exists.
 * @throws {Error} Throws an error if the mobile number already exists.
 * @throws {Error} Throws an error if the user record fails to insert or return an ID.
 */
export const signupService = async (input: SignupRequestBodyType) => {
  try {
    const { email, mobile } = input;

    //check does user with email exists
    if (email) {
      const isUserExists = await isUserExistsWithEmailQuery(email);
      if (isUserExists) {
        throw new Error("User with email already exists");
      }
    }

    //check does user with mobile exists
    if (mobile) {
      const isUserExists = await isUserExistsWithMobileQuery(mobile);
      if (isUserExists) {
        throw new Error("User with mobile already exists");
      }
    }

    const hashedPassword = bcrypt.hashSync(input.password, 10);
    //create user
    const inesrtResult = await insertUsersQuery([
      {
        email: email,
        firstName: input.firstName,
        lastName: input.lastName,
        mobile: input.mobile,
        dialCode: input.dialCode,
        password: hashedPassword,
      },
    ]);
    const userId = inesrtResult[0].insertId;
    if (!userId) {
      throw new Error("User not created");
    }
    return { userId };
  } catch (error) {
    throw error;
  }
};

export const loginService = async (input: LoginRequestBodyType) => {
  try {
    const { email, mobile, password } = input;
    const user = await getUserQuery({ email, mobile });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.password) {
      const isPasswordMatch = bcrypt.compareSync(password, user.password);
      if (!isPasswordMatch) {
        throw new Error("Invalid password");
      }
    } else {
      throw new Error("Password not set");
    }

    const token = await generateJwtAuthToken({
      userId: user.userId,
      email: user.email,
      firstName: user.firstName,
    });

    return {
      userId: user.userId,
      email: user.email,
      mobile: user.mobile,
      dialCode: user.dialCode,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      token: token,
    };
  } catch (error) {
    throw error;
  }
};
