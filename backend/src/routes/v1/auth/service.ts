import { generateJwtAuthToken } from "@/utils/jwt-helpers.js";
import bcrypt from "bcryptjs";
import {
  getUserQuery,
  insertUsersQuery,
  isUserExistsWithEmailQuery,
  isUserExistsWithMobileQuery,
  updateUserQuery,
} from "./queries.js";
import { LoginRequestBodyType, SignupRequestBodyType } from "./validator.js";
import { generateApiKey } from "@/utils/encryption.js";
import { CustomError } from "@/utils/error-helpers.js";
import { getCurrentDate } from "@/utils/date-helpers.js";

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
  const { email, mobile } = input;

  //check does user with email exists
  if (email) {
    const isUserExists = await isUserExistsWithEmailQuery(email);
    if (isUserExists) {
      throw new CustomError("User with email already exists", 400);
    }
  }

  //check does user with mobile exists
  if (mobile) {
    const isUserExists = await isUserExistsWithMobileQuery(mobile);
    if (isUserExists) {
      throw new CustomError("User with mobile already exists", 400);
    }
  }

  const hashedPassword = bcrypt.hashSync(input.password, 10);
  //create user
  const inesrtResult = await insertUsersQuery([
    {
      userType: input.userType,
      email: email,
      firstName: input.firstName,
      lastName: input.lastName,
      mobile: input.mobile,
      dialCode: input.dialCode,
      password: hashedPassword,
      createdAt: getCurrentDate(),
      updatedAt: getCurrentDate(),
    },
  ]);
  const userId = inesrtResult[0].insertId;
  if (!userId) {
    throw new CustomError("Error creating user", 500);
  }
  return { userId };
};

/**
 * Business logic service to handle user login.
 * Checks if the user exists, validates the password, and generates a JWT token.
 * * @param {LoginRequestBodyType} input - The validated user login payload.
 * @param {string} [input.email] - Optional email address of the user.
 * @param {string} [input.mobile] - Optional mobile number of the user.
 * @param {string} input.password - The plain text password to be validated.
 * * @returns {Promise<{ userId: string | number }>} A promise resolving to an object containing the user's information and JWT token.
 * * @throws {Error} Throws an error if the user is not found.
 * @throws {Error} Throws an error if the password is invalid.
 */
export const loginService = async (input: LoginRequestBodyType) => {
  const { email, mobile, password } = input;
  const user = await getUserQuery({ email, mobile });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  if (user.password) {
    const isPasswordMatch = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatch) {
      throw new CustomError("Invalid password", 400);
    }
  } else {
    throw new CustomError("Password not set for this user", 400);
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
    userType: user.userType,
  };
};

/**
 * Business logic service to generate a new API key for a user.
 * * @param {number} userId - The ID of the user to generate the API key for.
 * * @returns {Promise<{ apiKey: string }>} A promise resolving to an object containing the newly generated API key.
 */
export const generateApiKeyService = async (userId: number) => {
  const apiKey = generateApiKey();
  await updateUserQuery(userId, {
    apiKey: apiKey,
    updatedAt: getCurrentDate(),
  });
  return { apiKey };
};
