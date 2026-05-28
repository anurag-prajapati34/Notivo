import { NextFunction, Request, Response } from "express";
import z from "zod";
import { logger } from "./logger";
import { badRequest } from "./response";
/**
 * Express middleware factory that validates the incoming request body against a Zod schema.
 * If validation fails, it logs all issues and responds with a `badRequest` (400) containing the first error.
 * If validation succeeds, `req.body` is replaced with the safely parsed/stripped data.
 * * @template T - The TypeScript type inferred from the Zod schema.
 * @param {z.ZodSchema<T>} schema - The Zod validation schema to parse the request body against.
 * @returns {(req: Request, res: Response, next: NextFunction) => void} An Express middleware function.
 * * @example
 * const userSchema = z.object({ name: z.string(), age: z.number() });
 * router.post('/user', validateRequestBody(userSchema), userController);
 */
export const validateRequestBody =
  <T>(schema: z.ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, success, error } = schema.safeParse(req.body);
      if (!success) {
        const issues = error.issues;
        logger.error(issues);
        const firstError = issues[0];
        const message = firstError.message;
        const path = firstError.path[0].toString();
        return badRequest(res, `${path}: ${message}`);
      }
      req.body = data;
      next();
    } catch (error) {
      next(error);
    }
  };

/**
 * Express middleware factory that validates the incoming URL query parameters against a Zod schema.
 * If validation fails, it logs all issues and responds with a `badRequest` (400) containing the first error.
 * If validation succeeds, `req.query` is replaced with the typed, parsed, and coerced data.
 * * @template T - The TypeScript type inferred from the Zod schema.
 * @param {z.ZodSchema<T>} schema - The Zod validation schema to parse the request query parameters against.
 * @returns {(req: Request, res: Response, next: NextFunction) => void} An Express middleware function.
 * * @example
 * const paginationSchema = z.object({ page: z.coerce.number(), limit: z.coerce.number() });
 * router.get('/items', validateRequestQuery(paginationSchema), itemController);
 */
export const validateRequestQuery =
  <T>(schema: z.ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, success, error } = schema.safeParse(req.query);
      if (!success) {
        const issues = error.issues;
        logger.error(issues);
        const firstError = issues[0];
        const message = firstError.message;
        const path = firstError.path[0].toString();
        return badRequest(res, `${path}: ${message}`);
      }
      (req.query as any) = data;
      next();
    } catch (error) {
      next(error);
    }
  };

export const stringSchema = (
  name: string,
  minLength?: number,
  maxLength?: number,
) => {
  return z
    .string()
    .min(minLength || 1, {
      message: `${name} must be at least ${minLength} characters long`,
    })
    .max(maxLength || 1000, {
      message: `${name} must be at most ${maxLength} characters long`,
    });
};

export const stringSchemaOptional = (
  name: string,
  minLength?: number,
  maxLength?: number,
) => {
  return z
    .string()
    .min(minLength || 1, {
      message: `${name} must be at least ${minLength} characters long`,
    })
    .max(maxLength || 1000, {
      message: `${name} must be at most ${maxLength} characters long`,
    })
    .optional();
};
