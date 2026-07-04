import { db } from "@/database/connection.js";
import { emails, emailTemplates } from "@/database/schema/index.js";
import { emailStatus } from "@/utils/enum.js";
import { count, desc, eq, sql } from "drizzle-orm";

// GET /dashboard/stats
export const getAnalyticsStatusQuery = async (input: { userId: number }) => {
  const { userId } = input;
  const [overview, last7Days, templateUsage, recentEmails] = await Promise.all([
    // 4 stat cards
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

    // chart data last 7 days
    db
      .select({
        date: sql`DATE(created_at)`,
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
      .limit(7),

    // template usage
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

    // recent emails
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

  return {
    overview: overview[0],
    last7Days,
    templateUsage,
    recentEmails,
  };
};
