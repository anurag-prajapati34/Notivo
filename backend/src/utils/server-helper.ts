import {
  doesUserHaveEmailQuery,
  getGuestUserQuery,
} from "@/routes/v1/analytics/queries.js";
import { getCurrentIndianDate } from "./date-helpers.js";
import { logger } from "./logger.js";
import { refreshDemoDataDates } from "@/database/seed/refresh-demo-data-dates.js";
import { seedDemoData } from "@/database/seed/demo-email-data.js";

/**
 * Seed demo data for guest users
 * @returns
 */
export async function handleDemoDataSeed() {
  const demoUser = await getGuestUserQuery();
  if (!demoUser) {
    logger.error("Demo user not found");
    return null;
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
      userId: demoUser.userId,
      demoUserId: demoUser.userId,
    });
  }

  return result;
}

/**
 * Smart self-ping scheduler designed to keep Render Free Tier containers awake
 * strictly during high-visibility daytime hours to optimize free instance limits.
 * * @param {string} url - The complete target destination health check endpoint.
 */
export async function startScheduledSelfPinging(url: string) {
  const minutes = Number(process.env.healthPingInterval || "12");
  const INTERVAL_MINUTES = minutes * 60 * 1000; // Keeps container warm before the 15-minute sleep deadline

  const startHour = 11; //11: am
  const endHour = 22; //10: pm
  let totalPings = 0;
  let successfulPings = 0;
  let failedPings = 0;

  logger.info(
    `📡 [Engine Wakeup] Scheduled self-ping daemon active. Target window: ${startHour}:00 - ${endHour}:00. Ping server time for every ${minutes} minutes. Endpoint: ${url}`,
  );

  setInterval(async () => {
    const now = getCurrentIndianDate();
    const currentHour = now.hour();
    const timestamp = now.format("HH:mm:ss");

    // ⏰ Restrict active processing pings strictly between 9:00 AM and 9:00 PM
    if (currentHour >= startHour && currentHour < endHour) {
      try {
        totalPings++;
        const startTime = performance.now();
        const response = await fetch(url);
        const duration = (performance.now() - startTime).toFixed(0);

        if (response.ok) {
          successfulPings++;
          logger.info(
            `📡 [Ping Success:${successfulPings}/${totalPings}] [${timestamp}] Inbound heartbeat received by ${url} | Status: ${response.status} | Latency: ${duration}ms`,
          );
        } else {
          failedPings++;
          logger.warn(
            `⚠️ [Ping Warning]:${failedPings}/${totalPings} [${timestamp}] Destination reached but returned non-200 status | URL: ${url} | Status: ${response.status}`,
          );
        }

        if (totalPings === 1 || totalPings === 5 || totalPings === 10) {
          logger.info(
            `🌱[SEED][${timestamp}] Starting demo data seeding process`,
          );
          const result = await handleDemoDataSeed();
          logger.info(
            `🌱[SEED][${timestamp}] Demo data seeding process completed. Result: ${JSON.stringify(result)}`,
          );
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown network exception";
        logger.error(
          `❌ [Ping Failure] [${timestamp}] Egress connection timeout or handshake drop | Target: ${url} | Reason: ${message}`,
        );
      }
    } else {
      // Quiet window throttling block
      logger.info(
        `💤 [Ping Sleep] [${timestamp}] Current hour (${currentHour}:00) falls outside active window. Throttling outbound requests to conserve free tier hours.`,
      );
    }
  }, INTERVAL_MINUTES);
}
