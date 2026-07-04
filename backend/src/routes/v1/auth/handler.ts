import { handleHandlerError } from "@/utils/error-helpers.js";
import { created } from "@/utils/response.js";
import { AuthRequest } from "@/utils/types.js";
import { Request, Response } from "express";
import { getEmailCredsQuery } from "../email/queries.js";
import { getUserQuery } from "./queries.js";
import {
  generateApiKeyService,
  loginService,
  signupService,
} from "./service.js";
import { LoginRequestBodyType, SignupRequestBodyType } from "./validator.js";

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

export const generateApiKeyHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId = req.user?.userId!;
    if (!userId) throw new Error("User not found");
    const [emailCreds] = await getEmailCredsQuery({ userId });
    if (!emailCreds) throw new Error("Email credentials not found");
    const result = await generateApiKeyService(userId);
    return created(res, result, "User created successfully");
  } catch (error) {
    handleHandlerError(res, error);
  }
};

export const getApiKeyHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId!;
    if (!userId) throw new Error("User not found");
    const user = await getUserQuery({ userId });
    if (!user) throw new Error("User not found");
    const apiKey = await user.apiKey;

    return created(res, { apiKey }, "User created successfully");
  } catch (error) {
    handleHandlerError(res, error);
  }
};
