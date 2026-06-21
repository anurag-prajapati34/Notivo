export const emailStatus = {
  PENDING: "PENDING",
  SENT: "SENT",
  FAILED: "FAILED",
} as const;
export type EmailStatus = (typeof emailStatus)[keyof typeof emailStatus];
export const EmailStatusEnum = Object.values(emailStatus);
