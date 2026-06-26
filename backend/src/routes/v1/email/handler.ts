import { addEmailJob } from "@/jobs/email-queue";
import { emailStatus } from "@/utils/enum";
import { handleHandlerError } from "@/utils/error-helpers";
import { success } from "@/utils/response";
import { AuthRequest } from "@/utils/types";
import { Request, Response } from "express";
import {
  getEmailTemplatesWithVariablesQuery,
  insertEmailsQuery,
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
