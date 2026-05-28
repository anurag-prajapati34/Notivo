import { handleHandlerError } from "@/utils/error-helpers";
import { created } from "@/utils/response";
import { Request, Response } from "express";
import { loginService, signupService } from "./service";
import { LoginRequestBodyType, SignupRequestBodyType } from "./validator";

/**
 * Express controller handler for the user signup route.
 * Extracts the parsed body, invokes the signup service, and returns a HTTP 201 Created response.
 * Delegates runtime exceptions to the central error logger/handler.
 * * @param {Request} req - Express request object containing the typed `SignupRequestBodyType` in `req.body`.
 * @param {Response} res - Express response object used to send the status and payload back to the client.
 * @returns {Promise<Response | void>} Resolves to an Express response with status 201 on success, or forwards the error.
 */
export const signupHandler = async (req: Request, res: Response) => {
  try {
    const reqBody = req.body as SignupRequestBodyType;
    const result = await signupService(reqBody);
    return created(res, result, "User created successfully");
  } catch (error) {
    handleHandlerError(res, error);
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const reqBody = req.body as LoginRequestBodyType;
    const result = await loginService(reqBody);
    return created(res, result, "User created successfully");
  } catch (error) {
    handleHandlerError(res, error);
  }
};
