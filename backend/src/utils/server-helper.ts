import { logger } from "./logger.js";

/**
 * Smart self-ping scheduler designed to keep Render Free Tier containers awake
 * strictly during high-visibility daytime hours to optimize free instance limits.
 * * @param {string} url - The complete target destination health check endpoint.
 */
export async function startScheduledSelfPinging(url: string) {
  const minutes = Number(process.env.healthPingInterval || "12");
  const INTERVAL_MINUTES = minutes * 60 * 1000; // Keeps container warm before the 15-minute sleep deadline

  const startHour = 11;
  const endHour = 19;
  logger.info(
    `📡 [Engine Wakeup] Scheduled self-ping daemon active. Target window: ${startHour}:00 - ${endHour}:00. Ping server time for every ${minutes} minutes. Endpoint: ${url}`,
  );

  setInterval(async () => {
    const now = new Date();
    const currentHour = now.getHours();
    const timestamp = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // ⏰ Restrict active processing pings strictly between 9:00 AM and 9:00 PM
    if (currentHour >= startHour && currentHour < endHour) {
      try {
        const startTime = performance.now();
        const response = await fetch(url);
        const duration = (performance.now() - startTime).toFixed(0);

        if (response.ok) {
          logger.info(
            `📡 [Ping Success] [${timestamp}] Inbound heartbeat received by ${url} | Status: ${response.status} | Latency: ${duration}ms`,
          );
        } else {
          logger.warn(
            `⚠️ [Ping Warning] [${timestamp}] Destination reached but returned non-200 status | URL: ${url} | Status: ${response.status}`,
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
