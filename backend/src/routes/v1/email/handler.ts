import { handleHandlerError } from "@/utils/error-helpers";
import { success } from "@/utils/response";
import { AuthRequest } from "@/utils/types";
import { Response } from "express";
import {
  getAllEmailsQuery,
  getEmailCredsQuery,
  getEmailTemplatesWithVariablesQuery,
} from "./queries";
import { sendEmailService, setEmailCredsService } from "./service";

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
    console.log(error);
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
