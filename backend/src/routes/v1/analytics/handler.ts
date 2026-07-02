import { handleHandlerError } from "@/utils/error-helpers";
import { AuthRequest } from "@/utils/types";
import { Request, Response } from "express";
import { getAnalyticsStatsService } from "./service";
import { success } from "@/utils/response";

export const getAnalyticsStatsHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const userId: number = req.user?.userId!;
    const result = await getAnalyticsStatsService({ userId: userId });
    return success(res, result, "Analytics stats fetched successfully");
  } catch (error: unknown) {
    await handleHandlerError(res, error);
  }
};
