import { config } from "@/config";
import jwt from "jsonwebtoken";

export interface JwtAuthPayload {
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
/**
 * Decodes a JSON Web Token (JWT) and returns the payload data.
 *
 * @param {string} token - The JWT to be decoded.
 * @returns {any} The decoded payload data.
 */

export const decodeJwt = (token: string) => {
  return jwt.verify(token, config.jwt.secret);
};
