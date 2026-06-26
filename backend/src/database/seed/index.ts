import { logger } from "@/utils/logger";
import { seedEmailTemplates } from "./email-templates";

(async () => {
  logger.info("Seeding email templates...");
  await seedEmailTemplates();
  logger.info("Email templates seeded successfully.");
  process.exit(1);
})();
