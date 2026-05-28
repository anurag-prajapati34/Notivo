import { config } from "@/config";
import jwt from "jsonwebtoken";

interface JwtAuthPayload {
  userId: number;
  email: string | null;
  firstName: string | null;
}

/**
 * Generates a JSON Web Token (JWT) for authentication.
 *
 * @param {JwtAuthPayload} payload - The data payload to be encoded within the token.
 * @returns {string} The signed JWT acting as the authentication token.
 */
export const generateJwtAuthToken = (payload: JwtAuthPayload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};
