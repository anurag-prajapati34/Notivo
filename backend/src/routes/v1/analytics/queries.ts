import { db } from "@/database/connection.js";
import { emails, emailTemplates, users } from "@/database/schema/index.js";
import { getCurrentIndianDate } from "@/utils/date-helpers.js";
import { emailStatus, userTypes } from "@/utils/enum.js";
import { and, count, desc, eq, sql } from "drizzle-orm";

// GET /dashboard/stats
export const getAnalyticsStatusQuery = async (input: { userId: number }) => {
  const { userId } = input;

  const [overview, last7DaysRaw, templateUsage, recentEmails] =
    await Promise.all([
      // 1. 4 stat cards
      db
        .select({
          total: count(),
          delivered: count(
            sql`CASE WHEN email_status = ${emailStatus.DELIVERED} THEN 1 END`,
          ),
          failed: count(
            sql`CASE WHEN email_status = ${emailStatus.FAILED} THEN 1 END`,
          ),
          pending: count(
            sql`CASE WHEN email_status = ${emailStatus.PENDING} THEN 1 END`,
          ),
        })
        .from(emails)
        .where(eq(emails.userId, userId)),

      // 2. Chart data last 7 days (Raw records from database)
      db
        .select({
          date: sql<string>`DATE(created_at)`,
          total: count(),
          failed: count(
            sql`CASE WHEN email_status = ${emailStatus.FAILED} THEN 1 END`,
          ),
          delivered: count(
            sql`CASE WHEN email_status = ${emailStatus.DELIVERED} THEN 1 END`,
          ),
        })
        .from(emails)
        .where(eq(emails.userId, userId))
        .groupBy(sql`DATE(created_at)`)
        .orderBy(desc(sql`DATE(created_at)`))
        .limit(7),

      // 3. Template usage
      db
        .select({
          templateName: emailTemplates.name,
          count: count(),
        })
        .from(emails)
        .innerJoin(
          emailTemplates,
          eq(emails.templateId, emailTemplates.templateId),
        )
        .where(eq(emails.userId, userId))
        .groupBy(emailTemplates.templateId, emailTemplates.name)
        .orderBy(desc(count()))
        .limit(5),

      // 4. Recent emails
      db
        .select({
          templateId: emails.templateId,
          toEmail: emails.toEmail,
          subject: emails.subject,
          body: emails.body,
          emailStatus: emails.emailStatus,
          attempts: emails.attempts,
          lastErrorMessage: emails.lastErrorMessage,
          deliveredAt: emails.deliveredAt,
          createdAt: emails.createdAt,
          emailId: emails.emailId,
        })
        .from(emails)
        .innerJoin(
          emailTemplates,
          eq(emails.templateId, emailTemplates.templateId),
        )
        .where(eq(emails.userId, userId))
        .orderBy(desc(emails.createdAt))
        .limit(5),
    ]);

  // Create a high-speed Map out of database records for O(1) matching checks
  const dbRecordsMap = new Map(last7DaysRaw.map((row) => [row.date, row]));

  const formattedLast7Days = [];
  const baseIndianDate = getCurrentIndianDate(); // Dayjs instance tracking Indian Timezone

  // Sequentially backtrack exactly 7 steps starting directly from today
  for (let i = 6; i >= 0; i--) {
    const targetDateString = baseIndianDate
      .subtract(i, "day")
      .format("YYYY-MM-DD");

    const existingDbRecord = dbRecordsMap.get(targetDateString);

    if (existingDbRecord) {
      formattedLast7Days.push({
        date: targetDateString,
        total: Number(existingDbRecord.total),
        failed: Number(existingDbRecord.failed),
        delivered: Number(existingDbRecord.delivered),
      });
    } else {
      // Clean fallback object structural representation for zeroed dates
      formattedLast7Days.push({
        date: targetDateString,
        total: 0,
        failed: 0,
        delivered: 0,
      });
    }
  }

  return {
    overview: overview[0],
    last7Days: formattedLast7Days, // Returns chronological, non-fragmented metrics array
    templateUsage,
    recentEmails,
  };
};

export const getGuestUserQuery = async () => {
  const result = await db
    .select({
      userId: users.userId,
    })
    .from(users)
    .where(and(eq(users.status, true), eq(users.userType, userTypes.GUEST)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
};

export const doesUserHaveEmailQuery = async (input: { userId: number }) => {
  const result = await db
    .select({
      emailId: emails.emailId,
    })
    .from(emails)
    .where(eq(emails.userId, input.userId))
    .limit(1)
    .execute();

  return result.length > 0;
};
