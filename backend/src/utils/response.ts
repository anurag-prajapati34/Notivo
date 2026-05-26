import { Response } from "express";
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    nextCursor?: number | null;
  };
}
export const success = <T>(
  res: Response,
  data?: T,
  message: string = "Success",
  statusCode: number = 200,
  meta?: ApiResponse["meta"],
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    ...(data && { data }),
    ...(meta && { meta }),
  };

  return res.status(statusCode).json(response);
};
export const error = (
  res: Response,
  message: string = "Error occurred",
  statusCode: number = 500,
  data?: any,
) => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(data && { data }),
  };

  return res.status(statusCode).json(response);
};

export const created = <T>(
  res: Response,
  data: T,
  message: string = "Created successfully",
) => {
  return success(res, data, message, 201);
};

export const noContent = (res: Response) => {
  return res.status(204).send();
};

export const badRequest = (res: Response, message: string = "Bad request") => {
  return error(res, message, 400);
};

export const unauthorized = (
  res: Response,
  message: string = "Unauthorized",
) => {
  return error(res, message, 401);
};

export const forbidden = (res: Response, message: string = "Forbidden") => {
  return error(res, message, 403);
};

export const notFound = (res: Response, message: string = "Not found") => {
  return error(res, message, 404);
};

export const conflict = (res: Response, message: string = "Conflict") => {
  return error(res, message, 409);
};

export const validationError = (
  res: Response,
  message: string = "Validation failed",
) => {
  return error(res, message, 422);
};

export const internalServerError = (
  res: Response,
  message: string = "Internal server error",
) => {
  return error(res, message, 500);
};
