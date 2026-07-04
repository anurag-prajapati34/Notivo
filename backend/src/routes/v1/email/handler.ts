import { handleHandlerError } from "@/utils/error-helpers.js";
import { success } from "@/utils/response.js";
import { AuthRequest } from "@/utils/types.js";
import { Response } from "express";
import {
  getAllEmailsQuery,
  getEmailCredsQuery,
  getEmailTemplatesWithVariablesQuery,
} from "./queries.js";
import {
  getEmailDetailsService,
  sendEmailService,
  sendTestEmailService,
  setEmailCredsService,
} from "./service.js";

export async function sendEmailHandler(req: AuthRequest, res: Response) {
  try {
    const userId: number = req.user?.userId!;
    await sendEmailService({
      ...req.body,
      userId,
    });
    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      data: null,
    });
  }
}

export async function setEmailCredsHandler(req: AuthRequest, res: Response) {
  try {
    const userId: number = req.user?.userId!;
    await setEmailCredsService({
      ...req.body,
      userId,
    });
    return success(res, null, "Email credentials updated successfully");
  } catch (error) {
    handleHandlerError(res, error);
  }
}

export async function getEmailTemplatesHandler(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId: number = req.user?.userId!;
    const result = await getEmailTemplatesWithVariablesQuery();
    return success(res, result, "Email credentials updated successfully");
  } catch (error) {
    handleHandlerError(res, error);
  }
}

export const getEmailsListHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId: number = req.user?.userId!;
    const result = await getAllEmailsQuery({ userId: userId });
    return success(res, result, "Email credentials updated successfully");
  } catch (error) {
    handleHandlerError(res, error);
  }
};

export const getEmailCredsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId: number = req.user?.userId!;
    const [result] = await getEmailCredsQuery({ userId: userId });
    return success(res, result, "Email credentials fetched successfully");
  } catch (error) {
    handleHandlerError(res, error);
  }
};

export const sendTestEmailHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId: number = req.user?.userId!;
    await sendTestEmailService({
      ...req.body,
      userId,
    });
    return success(res, null, "Email sent successfully");
  } catch (error) {
    handleHandlerError(res, error);
  }
};

export const getEmailDetailsHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId: number = req.user?.userId!;
    const emailIdStr = req.params.emailId;
    if (!emailIdStr) throw new Error("Email id is required");
    const emailId = Number(emailIdStr);
    const result = await getEmailDetailsService({
      userId: userId,
      emailId: emailId,
    });
    return success(res, result, "Email credentials fetched successfully");
  } catch (error) {
    handleHandlerError(res, error);
  }
};
