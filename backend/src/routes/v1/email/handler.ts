import { emailProviders } from "@/utils/enum.js";
import { handleHandlerError } from "@/utils/error-helpers.js";
import { success } from "@/utils/response.js";
import { maskString } from "@/utils/string-helpers.js";
import { AuthRequest } from "@/utils/types.js";
import { Response } from "express";
import {
  getAllEmailsQuery,
  getEmailTemplatesWithVariablesQuery,
} from "./queries.js";
import {
  getEmailCredsService,
  getEmailDetailsService,
  sendEmailService,
  sendTestEmailService,
  setEmailCredsService,
} from "./service.js";
import { GetEmailCredsQuery } from "./validator.js";
import { dcrypt } from "@/utils/encryption.js";

export async function sendEmailHandler(req: AuthRequest, res: Response) {
  try {
    const userId: number = req.user?.userId!;
    await sendEmailService({
      ...req.body,
      userId,
    });
    return success(res, null, "Email sent successfully");
  } catch (error) {
    handleHandlerError(res, error);
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

export const getEmailCredsHandler = async (
  req: AuthRequest & { query: GetEmailCredsQuery },
  res: Response,
) => {
  try {
    const userId: number = req.user?.userId!;
    let result = await getEmailCredsService({
      userId: userId,
      provider: req.query.provider,
    });
    if (!result) return success(res, null, "Email credentials not found");
    const { provider, creds: emailCreds } = result;
    if (provider === emailProviders.SMTP) {
      result = {
        creds: {
          ...emailCreds,
          passKey: maskString({
            str: dcrypt((emailCreds as any).passKey as string),
            start: 2,
            end: 2,
          }),
        },
        provider: provider,
      };
    } else {
      result = {
        creds: {
          ...emailCreds,
          apiKey: maskString({
            str: dcrypt((emailCreds as any).apiKey as string),
            start: 6,
            end: 6,
          }),
        },
        provider: provider,
      };
    }

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
