import { Response } from "express";
import { logger } from "./logger";
import { internalServerError } from "./response";

/**
 * Centrally handles controller/handler layer runtime exceptions.
 * * This utility performs two critical roles:
 * 1. **Logging**: Captures and logs the full technical error and stack trace for internal monitoring.
 * 2. **Security/Sanitization**: Prevents sensitive system or database internals from leaking to clients
 * in production by masking raw error messages with a generic fallback, while allowing full visibility
 * during local development.
 * * @param {Response} res - The Express response object used to send the error payload.
 * @param {any} error - The caught error object, which may or may not be an instance of `Error`.
 * @returns {Response} The forwarded Express response object with a 500 status code.
 * * @example
 * try {
 * await someService();
 * } catch (error) {
 * return handleHandlerError(res, error);
 * }
 */
export const handleHandlerError = (res: Response, error: any) => {
  const isDevelopment = process.env.NODE_ENV === "development";
  const rawMessage = error instanceof Error ? error.message : "Unknown error";

  // 1. Log the full technical error
  logger.error(rawMessage, { error });

  // 2. Determine what message the client sees.
  // In production, never leak raw DB/system errors unless they are custom-thrown business errors.
  const clientMessage = isDevelopment
    ? rawMessage
    : "Something went wrong. Please try again later.";

  return internalServerError(res, clientMessage);
};
