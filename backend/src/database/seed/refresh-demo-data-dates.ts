import { db } from "../connection.js";
import { emails } from "@/database/schema/emails.js";
import { emailAttempts } from "@/database/schema/email-attempts.js";
import { logger } from "@/utils/logger.js";
import { eq, asc } from "drizzle-orm";
import { seedPlan } from "./demo-email-data.js";

// Re-use your exact time-calculation helper relative to the current execution run
const computeNewDate = (daysAgo: number, hours: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, 0, 0, 0);
  return d;
};

/**
 * High-performance demo utility that shifts historical email timestamps
 * forward to look fresh without dropping rows or running heavy inserts.
 */
export const refreshDemoDataDates = async (input: { demoUserId: number }) => {
  const DEMO_USER_ID = input.demoUserId;
  logger.info("🔄 Initiating high-speed demo data timeline refresh...");

  try {
    // 1. Fetch all existing demo emails sequentially matching their original insertion order
    const existingEmails = await db
      .select({
        emailId: emails.emailId,
        emailStatus: emails.emailStatus,
        attempts: emails.attempts,
      })
      .from(emails)
      .where(eq(emails.userId, DEMO_USER_ID))
      .orderBy(asc(emails.emailId));

    if (existingEmails.length === 0) {
      logger.warn(
        "⚠️ No demo data found to refresh. Run your original seed script first!",
      );
      return {
        updatedRecords: 0,
        totalEmails: 0,
      };
    }

    // Define the exact chronological day/hour structure from your original seed plan
    // This allows us to map each sequential database row back to its ideal chart trend line position
    const originalTimeline = seedPlan;

    let updatedRecords = 0;

    // 2. Loop through every existing database entry and calculate its new timeline alignment
    for (let i = 0; i < existingEmails.length; i++) {
      const email = existingEmails[i];

      // Fallback safeguard: if your database rows somehow exceed the predefined list, pin them to today
      const layout = originalTimeline[i] ?? { daysAgo: 0, hours: 12 };

      const newCreatedAt = computeNewDate(layout.daysAgo, layout.hours);

      // Calculate a realistic delivery timestamp if the email was successfully processed
      const newDeliveredAt =
        email.emailStatus === "DELIVERED"
          ? new Date(
              newCreatedAt.getTime() + 8000 * Math.max(email.attempts || 1, 1),
            )
          : null;

      // 3. Update the main email entry record
      await db
        .update(emails)
        .set({
          createdAt: newCreatedAt,
          updatedAt: newCreatedAt,
          deliveredAt: newDeliveredAt,
        })
        .where(eq(emails.emailId, email.emailId));

      // 4. Fetch and update all sequential retry attempts tied to this specific email
      const attemptsList = await db
        .select({
          attemptId: emailAttempts.emailId,
          attemptNumber: emailAttempts.attemptNumber,
        }) // Adjust fields to match your schema keys
        .from(emailAttempts)
        .where(eq(emailAttempts.emailId, email.emailId))
        .orderBy(asc(emailAttempts.attemptNumber));

      for (const attempt of attemptsList) {
        // Space out each attempt by 35 seconds to simulate an exponential backoff sequence
        const newAttemptedAt = new Date(
          newCreatedAt.getTime() + (attempt.attemptNumber - 1) * 35000,
        );

        await db
          .update(emailAttempts)
          .set({
            attemptedAt: newAttemptedAt,
            createdAt: newAttemptedAt,
            updatedAt: newAttemptedAt,
          })
          .where(eq(emailAttempts.emailId, email.emailId)); // Adjust target condition if you have a unique attemptId key
      }

      updatedRecords++;
    }

    logger.info(
      `✅ Timeline refresh completed successfully! Shifted ${updatedRecords} demo entries.`,
    );
    return {
      updatedRecords,
      totalEmails: existingEmails.length,
    };
  } catch (error) {
    logger.error("❌ Failed to refresh demo data timelines", { error });
    return {
      updatedRecords: 0,
      totalEmails: 0,
    };
  }
};
