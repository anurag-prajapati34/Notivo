import { emailProviders, userTypes } from "@/utils/enum.js";
import { handleHandlerError } from "@/utils/error-helpers.js";
import { created, success } from "@/utils/response.js";
import { AuthRequest } from "@/utils/types.js";
import { Request, Response } from "express";
import { getEmailCredsService } from "../email/service.js";
import { getUserQuery } from "./queries.js";
import {
  generateApiKeyService,
  loginService,
  signupService,
} from "./service.js";
import { SignupRequestBodyType } from "./validator.js";
import { maskString } from "@/utils/string-helpers.js";

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

export const extractLoginCreds = async (req: Request, res: Response) => {
  //Basic auth username and password
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    throw new Error("Basic auth required");
  }
  const [username, password] = Buffer.from(authHeader.substring(6), "base64")
    .toString()
    .split(":");

  if (!username || !password) {
    throw new Error("Basic auth required");
  }
  return {
    email: username,
    password: password,
  };
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const creds = await extractLoginCreds(req, res);
    const result = await loginService(creds);
    return success(res, result, "User created successfully");
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
    const emailCreds = await getEmailCredsService({
      userId,
      provider: emailProviders.SENDGRID,
    });
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

    let apiKey = await user.apiKey;

    return created(res, { apiKey }, "User created successfully");
  } catch (error) {
    handleHandlerError(res, error);
  }
};
