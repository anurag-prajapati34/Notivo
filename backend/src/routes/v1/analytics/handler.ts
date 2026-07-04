import { handleHandlerError } from "@/utils/error-helpers.js";
import { success } from "@/utils/response.js";
import { AuthRequest } from "@/utils/types.js";
import { Response } from "express";
import { getAnalyticsStatsService } from "./service.js";

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
