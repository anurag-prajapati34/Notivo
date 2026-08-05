import { config } from "@/config/index.js";
import { emailAttempts } from "@/database/schema/email-attempts.js";
import { emailTemplateVariables } from "@/database/schema/email-template-variables.js";
import { emailTemplates } from "@/database/schema/email-templates.js";
import { emails } from "@/database/schema/emails.js";
import { dayjs, getCurrentIndianDate } from "@/utils/date-helpers.js";
import { emailProviders, emailStatus } from "@/utils/enum.js";
import { logger } from "@/utils/logger.js";
import "dotenv/config.js";
import { eq, inArray } from "drizzle-orm";
import { db } from "../connection.js";

const FRONTEND_URL = config.frontend.url;

// ─── Realistic variable values per variable name ──────────────────────────────
const variableSampleValues: Record<string, string[]> = {
  name: [
    "Rahul Sharma",
    "Priya Verma",
    "Amit Kumar",
    "Sneha Patel",
    "Raj Singh",
  ],
  email: [
    "rahul.sharma@gmail.com",
    "priya.verma@gmail.com",
    "amit.kumar@outlook.com",
    "sneha.patel@yahoo.com",
    "raj.singh@gmail.com",
  ],
  otp: ["482910", "293847", "174823", "938471", "628374"],
  platformName: ["Notivo", "Notivo"],
  appName: ["Notivo", "Notivo"],
  expiryMinutes: ["10", "15", "30"],
  resetLink: [
    `${FRONTEND_URL}/reset?token=abc123xyz`,
    `${FRONTEND_URL}/reset?token=def456uvw`,
    `${FRONTEND_URL}/reset?token=ghi789rst`,
  ],
  verificationLink: [
    `${FRONTEND_URL}/verify?token=abc123`,
    `${FRONTEND_URL}/verify?token=def456`,
  ],
  _default: ["Demo Value", "Test Value", "Sample Value"],
};

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getVariableValue = (variableName: string): string => {
  const values =
    variableSampleValues[variableName] ?? variableSampleValues._default;
  return pick(values);
};

// ─── validateAndReplaceVariables — same logic as production ───────────────────
const validateAndReplaceVariables = (
  html: string,
  subject: string,
  inputVariables: { variableName: string; variableValue: string }[],
  templateVariables: {
    variableName: string;
    isRequired: boolean;
    templateId: string;
    defaultValue: string | null;
  }[],
) => {
  const allRequiredVariables = templateVariables.filter((v) => v.isRequired);

  const missing = allRequiredVariables.filter(
    (v) => !inputVariables.find((iv) => iv.variableName === v.variableName),
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required variables: ${missing.map((v) => v.variableName).join(", ")}`,
    );
  }

  let updatedHtml = html;
  let updatedSubject = subject;

  allRequiredVariables.forEach((variable) => {
    const value = inputVariables.find(
      (v) => v.variableName === variable.variableName,
    )?.variableValue;

    if (!value) throw new Error(`Missing value for: ${variable.variableName}`);

    updatedHtml = updatedHtml.replaceAll(`{{${variable.variableName}}}`, value);
    updatedSubject = updatedSubject.replaceAll(
      `{{${variable.variableName}}}`,
      value,
    );
  });

  return { html: updatedHtml, subject: updatedSubject };
};

// ─── Time helpers ─────────────────────────────────────────────────────────────
// Updated: Start from midnight of today and subtract N days to avoid shifting errors
const daysAgo = (days: number, hours = 10): Date => {
  return getCurrentIndianDate()
    .startOf("day")
    .subtract(days, "day")
    .hour(hours)
    .minute(0)
    .second(0)
    .millisecond(0)
    .toDate();
};

// ─── Seed plan ────────────────────────────────────────────────────────────────
// Spread emails across 7 days continuously (Day 6 down to Day 0) with smooth growing volume
export const seedPlan: {
  recipientIndex: number;
  daysAgo: number;
  hours: number;
  finalStatus: string;
  totalAttempts: number;
}[] = [
  // Day 6 — 4 emails
  {
    recipientIndex: 0,
    daysAgo: 6,
    hours: 9,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 1,
    daysAgo: 6,
    hours: 12,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 2,
    daysAgo: 6,
    hours: 15,
    finalStatus: emailStatus.FAILED,
    totalAttempts: 3,
  },
  {
    recipientIndex: 3,
    daysAgo: 6,
    hours: 18,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },

  // Day 5 — 5 emails
  {
    recipientIndex: 4,
    daysAgo: 5,
    hours: 8,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 2,
    daysAgo: 5,
    hours: 11,
    finalStatus: emailStatus.FAILED,
    totalAttempts: 3,
  },
  {
    recipientIndex: 0,
    daysAgo: 5,
    hours: 13,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 3,
    daysAgo: 5,
    hours: 15,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 2,
  },
  {
    recipientIndex: 1,
    daysAgo: 5,
    hours: 18,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },

  // Day 4 — 7 emails
  {
    recipientIndex: 4,
    daysAgo: 4,
    hours: 8,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 0,
    daysAgo: 4,
    hours: 9,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 2,
    daysAgo: 4,
    hours: 11,
    finalStatus: emailStatus.FAILED,
    totalAttempts: 3,
  },
  {
    recipientIndex: 3,
    daysAgo: 4,
    hours: 13,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 2,
  },
  {
    recipientIndex: 1,
    daysAgo: 4,
    hours: 15,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 4,
    daysAgo: 4,
    hours: 17,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 3,
  },
  {
    recipientIndex: 0,
    daysAgo: 4,
    hours: 19,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },

  // Day 3 — 8 emails
  {
    recipientIndex: 1,
    daysAgo: 3,
    hours: 8,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 3,
    daysAgo: 3,
    hours: 9,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 2,
    daysAgo: 3,
    hours: 10,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 2,
  },
  {
    recipientIndex: 0,
    daysAgo: 3,
    hours: 12,
    finalStatus: emailStatus.FAILED,
    totalAttempts: 3,
  },
  {
    recipientIndex: 4,
    daysAgo: 3,
    hours: 13,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 1,
    daysAgo: 3,
    hours: 15,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 3,
    daysAgo: 3,
    hours: 17,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 2,
  },
  {
    recipientIndex: 2,
    daysAgo: 3,
    hours: 19,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },

  // Day 2 — 9 emails
  {
    recipientIndex: 0,
    daysAgo: 2,
    hours: 8,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 4,
    daysAgo: 2,
    hours: 9,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 1,
    daysAgo: 2,
    hours: 10,
    finalStatus: emailStatus.FAILED,
    totalAttempts: 3,
  },
  {
    recipientIndex: 3,
    daysAgo: 2,
    hours: 11,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 2,
  },
  {
    recipientIndex: 2,
    daysAgo: 2,
    hours: 12,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 0,
    daysAgo: 2,
    hours: 13,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 4,
    daysAgo: 2,
    hours: 15,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 1,
    daysAgo: 2,
    hours: 17,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 3,
  },
  {
    recipientIndex: 3,
    daysAgo: 2,
    hours: 19,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },

  // Day 1 (Yesterday) — 11 emails [FIXED: Added missing day]
  {
    recipientIndex: 0,
    daysAgo: 1,
    hours: 8,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 2,
    daysAgo: 1,
    hours: 9,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 1,
    daysAgo: 1,
    hours: 10,
    finalStatus: emailStatus.FAILED,
    totalAttempts: 3,
  },
  {
    recipientIndex: 4,
    daysAgo: 1,
    hours: 11,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 2,
  },
  {
    recipientIndex: 3,
    daysAgo: 1,
    hours: 12,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 0,
    daysAgo: 1,
    hours: 14,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 2,
    daysAgo: 1,
    hours: 15,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 1,
    daysAgo: 1,
    hours: 16,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 2,
  },
  {
    recipientIndex: 4,
    daysAgo: 1,
    hours: 17,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 3,
    daysAgo: 1,
    hours: 18,
    finalStatus: emailStatus.FAILED,
    totalAttempts: 2,
  },
  {
    recipientIndex: 0,
    daysAgo: 1,
    hours: 19,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },

  // Day 0 (Today) — 12 emails (peak)
  {
    recipientIndex: 0,
    daysAgo: 0,
    hours: 8,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 2,
    daysAgo: 0,
    hours: 9,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 1,
    daysAgo: 0,
    hours: 10,
    finalStatus: emailStatus.FAILED,
    totalAttempts: 3,
  },
  {
    recipientIndex: 4,
    daysAgo: 0,
    hours: 11,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 2,
  },
  {
    recipientIndex: 3,
    daysAgo: 0,
    hours: 12,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 0,
    daysAgo: 0,
    hours: 13,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 2,
    daysAgo: 0,
    hours: 14,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 1,
    daysAgo: 0,
    hours: 15,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 3,
  },
  {
    recipientIndex: 4,
    daysAgo: 0,
    hours: 16,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
  {
    recipientIndex: 3,
    daysAgo: 0,
    hours: 17,
    finalStatus: emailStatus.FAILED,
    totalAttempts: 2,
  },
  {
    recipientIndex: 0,
    daysAgo: 0,
    hours: 18,
    finalStatus: emailStatus.PENDING,
    totalAttempts: 0,
  },
  {
    recipientIndex: 2,
    daysAgo: 0,
    hours: 19,
    finalStatus: emailStatus.DELIVERED,
    totalAttempts: 1,
  },
];

const recipients = [
  "rahul.sharma@gmail.com",
  "priya.verma@gmail.com",
  "amit.kumar@outlook.com",
  "sneha.patel@yahoo.com",
  "raj.singh@gmail.com",
];

const smtpErrors = [
  "Connection timeout: Unable to connect to smtp.gmail.com:465 after 5000ms",
  "535-5.7.8 Username and Password not accepted. Learn more at smtp.gmail.com",
  "ECONNREFUSED: Connection refused at 74.125.68.109:465",
  "421 Too many concurrent SMTP connections from this IP",
  "550 5.1.1 The email account does not exist",
];

// ─── Main seeder ──────────────────────────────────────────────────────────────
export const seedDemoData = async (input: {
  demoUserId: number;
  userId: number;
}) => {
  try {
    const DEMO_USER_ID = input.demoUserId;
    logger.info("Starting demo data seed...");

    // Step 1 — fetch all templates belonging to demo user
    const templates = await db
      .select({
        templateId: emailTemplates.templateId,
        name: emailTemplates.name,
        slug: emailTemplates.slug,
        subject: emailTemplates.subject,
        html: emailTemplates.html,
      })
      .from(emailTemplates)
      .where(eq(emailTemplates.status, true));

    if (templates.length === 0) {
      throw new Error(
        "No templates found for demo user. Run createDemoAccount.ts first.",
      );
    }

    logger.info(`Found ${templates.length} templates for demo user`);

    // Step 2 — fetch all variables for those templates in one query
    const templateIds = templates.map((t) => t.templateId);
    const allVariables = await db
      .select({
        templateId: emailTemplateVariables.templateId,
        variableName: emailTemplateVariables.variableName,
        isRequired: emailTemplateVariables.isRequired,
        defaultValue: emailTemplateVariables.defaultValue,
      })
      .from(emailTemplateVariables)
      .where(inArray(emailTemplateVariables.templateId, templateIds));

    // Group variables by templateId for easy lookup
    const variablesByTemplateId = allVariables.reduce<
      Record<string, typeof allVariables>
    >((acc, v) => {
      if (!acc[v.templateId]) acc[v.templateId] = [];
      acc[v.templateId].push(v);
      return acc;
    }, {});

    logger.info(
      `Found ${allVariables.length} variables across ${templates.length} templates`,
    );

    // Step 3 — clear existing demo emails
    const existingEmails = await db
      .select({ emailId: emails.emailId })
      .from(emails)
      .where(eq(emails.userId, DEMO_USER_ID));

    if (existingEmails.length > 0) {
      const emailIds = existingEmails.map((e) => e.emailId);

      await db
        .delete(emailAttempts)
        .where(inArray(emailAttempts.emailId, emailIds));

      await db.delete(emails).where(eq(emails.userId, DEMO_USER_ID));

      logger.info(`Cleared ${existingEmails.length} existing demo emails`);
    }

    // Step 4 — seed emails using real template data
    let seededCount = 0;
    let errorCount = 0;

    for (const plan of seedPlan) {
      try {
        const template = pick(templates);
        const templateVars = variablesByTemplateId[template.templateId] ?? [];

        const inputVariables = templateVars
          .filter((v) => v.isRequired)
          .map((v) => ({
            variableName: v.variableName,
            variableValue: getVariableValue(v.variableName),
          }));

        const { html, subject } = validateAndReplaceVariables(
          template.html,
          template.subject,
          inputVariables,
          templateVars,
        );

        const recipient = recipients[plan.recipientIndex];
        const createdAt = daysAgo(plan.daysAgo, plan.hours);
        const deliveredAt =
          plan.finalStatus === emailStatus.DELIVERED
            ? dayjs(createdAt)
                .add(8 * Math.max(plan.totalAttempts, 1), "second")
                .toDate()
            : null;

        const lastError =
          plan.finalStatus === emailStatus.FAILED ? pick(smtpErrors) : null;

        const [insertResult] = await db.insert(emails).values({
          userId: DEMO_USER_ID,
          templateId: template.templateId,
          toEmail: recipient,
          subject,
          body: html,
          emailStatus: plan.finalStatus,
          attempts: plan.totalAttempts,
          lastErrorMessage: lastError,
          deliveredAt,
          provider: emailProviders.SENDGRID,
          createdAt: createdAt,
          updatedAt: createdAt,
        });

        const emailId = insertResult.insertId;

        // Step 5 — insert attempt records for retry timeline
        for (
          let attemptNum = 1;
          attemptNum <= plan.totalAttempts;
          attemptNum++
        ) {
          const isLastAttempt = attemptNum === plan.totalAttempts;
          const isSuccess =
            isLastAttempt && plan.finalStatus === emailStatus.DELIVERED;

          const attemptedAt = dayjs(createdAt)
            .add((attemptNum - 1) * 35, "second")
            .toDate();

          await db.insert(emailAttempts).values({
            emailId,
            attemptNumber: attemptNum,
            emailStatus: isSuccess ? emailStatus.DELIVERED : emailStatus.FAILED,
            errorMessage: isSuccess ? null : pick(smtpErrors),
            attemptedAt,
            createdAt: attemptedAt,
            updatedAt: attemptedAt,
          });
        }

        seededCount++;
      } catch (err) {
        errorCount++;
        console.error(
          `Failed to seed email for plan index ${seededCount + errorCount}:`,
          err,
        );
      }
    }

    logger.info(`\nSeeding complete:`);
    logger.info(`  ✓ ${seededCount} emails seeded`);
    if (errorCount > 0) logger.info(`  ✗ ${errorCount} failed`);
    logger.info(`  Total attempts inserted: ${allVariables.length}`);

    return {
      seededCount,
      errorCount,
    };
  } catch (err) {
    logger.error("Failed to seed demo emails:", err);
    return {
      seededCount: 0,
      errorCount: 0,
    };
  }
};
