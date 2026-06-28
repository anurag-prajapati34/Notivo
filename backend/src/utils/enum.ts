export const emailStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  DELIVERED: "DELIVERED",
  FAILED: "FAILED",
} as const;
export type EmailStatus = (typeof emailStatus)[keyof typeof emailStatus];
export const EmailStatusEnum = Object.values(emailStatus);
