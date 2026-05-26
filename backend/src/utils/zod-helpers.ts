import { NextFunction, Request, Response } from "express";
import z from "zod";
import { logger } from "./logger";
import { badRequest } from "./response";
export const validateRequestBody =
  <T>(schema: z.ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, success, error } = schema.safeParse(req.body);
      if (!success) {
        const errorMessage = error.message;
        logger.error(errorMessage);
        return badRequest(res, error.message);
      }
      req.body = data;
      next();
    } catch (error) {
      return error;
    }
  };

export const validateRequestQuery =
  <T>(schema: z.ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, success, error } = schema.safeParse(req.query);
      if (!success) {
        const errorMessage = error.message;
        logger.error(errorMessage);
        return badRequest(res, error.message);
      }
      req.body = data;
      next();
    } catch (error) {
      return error;
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
