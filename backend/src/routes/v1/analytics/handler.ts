import { handleHandlerError } from "@/utils/error-helpers.js";
import { badRequest, success } from "@/utils/response.js";
import { AuthRequest } from "@/utils/types.js";
import { Response } from "express";
import { getAnalyticsStatsService } from "./service.js";
import { seedDemoData } from "@/database/seed/demo-email-data.js";
import { doesUserHaveEmailQuery, getGuestUserQuery } from "./queries.js";
import { logger } from "@/utils/logger.js";
import { refreshDemoDataDates } from "@/database/seed/refresh-demo-data-dates.js";

/*
 * Get analytics stats
 */
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

/**
 * Seed demo data for guest users
 */
export const seedDemoDataHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId: number = req.user?.userId!;
    const demoUser = await getGuestUserQuery();
    if (!demoUser) {
      return badRequest(res, "Demo user not found");
    }

    const hasEmail = await doesUserHaveEmailQuery({ userId: demoUser.userId });
    let result = null;
    if (hasEmail) {
      logger.info(
        "Demo deata is already seeded, now refreshing dates for to match todays date",
      );
      result = await refreshDemoDataDates({
        demoUserId: demoUser.userId,
      });
    } else {
      logger.info("Seeding demo data for demo user");
      result = await seedDemoData({
        userId: userId,
        demoUserId: demoUser.userId,
      });
    }
    return success(
      res,
      {
        action: hasEmail ? "refreshed" : "seeded",
        ...(result ? result : {}),
      },
      "Analytics stats fetched successfully",
    );
  } catch (error: unknown) {
    await handleHandlerError(res, error);
  }
};
