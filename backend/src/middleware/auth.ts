import { db } from "@/database/connection";
import { users } from "@/database/schema";
import { decodeJwt, JwtAuthPayload } from "@/utils/jwt-helpers";
import { unauthorized } from "@/utils/response";
import { and, eq } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Retrieves an active user from the database by their unique user ID.
 * * @param {number} userId - The unique identifier of the user to fetch.
 * @returns {Promise<object|null>} A promise that resolves to the user record object if found and active, or `null` otherwise.
 */
const getUserByUserId = async (userId: number) => {
  const result = await db
    .select({
      userId: users.userId,
      firstName: users.firstName,
      middleName: users.middleName,
      lastName: users.lastName,
      dialCode: users.dialCode,
      mobile: users.mobile,
      email: users.email,
    })
    .from(users)
    .where(and(eq(users.userId, userId), eq(users.status, true)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
};
/**
 * Retrieves an active user from the database by their API key.
 * * @param {string} apiKey - The API key of the user to fetch.
 * @returns {Promise<object|null>} A promise that resolves to the user record object if found and active, or `null` otherwise.
 */
const getUserByApiKey = async (apiKey: string) => {
  const result = await db
    .select({
      userId: users.userId,
      firstName: users.firstName,
      middleName: users.middleName,
      lastName: users.lastName,
      dialCode: users.dialCode,
      mobile: users.mobile,
      email: users.email,
    })
    .from(users)
    .where(and(eq(users.apiKey, apiKey), eq(users.status, true)))
    .limit(1);
  return result.length > 0 ? result[0] : null;
};

/**
 * Express middleware that validates the authorization headers for a valid Bearer token.
 * It decodes the JWT, verifies the user exists and is active in the database,
 * and attaches the user data to the request object (`req.user`).
 *
 * @param {Request} req - The Express request object. Expects an `Authorization: Bearer <token>` header.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * * @throws {Error} Passes an error to the next middleware if the token is missing, expired, or invalid.
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return unauthorized(res, "Access token required");
    }
    const token = authHeader.substring(7);

    const decoded = decodeJwt(token) as JwtAuthPayload;

    if (!decoded || !decoded.userId) {
      return unauthorized(res, "Invalid access token");
    }
    const user = await getUserByUserId(decoded.userId);
    if (!user) {
      return unauthorized(res, "Invalid access token");
    }
    (req as any).user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // next(new Error("Invalid access token"));
      next(unauthorized(res, "Invalid access token"));
    } else if (error instanceof jwt.TokenExpiredError) {
      // next(new Error("Access token expired"));
      next(unauthorized(res, "Access token expired"));
    } else {
      // next(error);
      next(unauthorized(res, "Invalid access token"));
    }
  }
};

export const authenticateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("API key required");
    }
    const apiKey = authHeader.substring(7);
    if (!apiKey) {
      throw new Error("API key required");
    }

    const user = await getUserByApiKey(apiKey);
    if (!user) {
      throw new Error("Invalid api key");
    }
    (req as any).user = user;

    next();
  } catch (error) {
    next(error);
  }
};
