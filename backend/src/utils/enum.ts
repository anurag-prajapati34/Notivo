export const emailStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  DELIVERED: "DELIVERED",
  FAILED: "FAILED",
} as const;
export type EmailStatus = (typeof emailStatus)[keyof typeof emailStatus];
export const EmailStatusEnum = Object.values(emailStatus);

export const userTypes = {
  ADMIN: "ADMIN", // Manages global platform infrastructure and logs
  USER: "USER", // Standard registered user creating templates and sending emails
  GUEST: "GUEST", // Read-only/Trial account for portfolio reviewers to explore the dashboard
} as const;
export type UserType = (typeof userTypes)[keyof typeof userTypes];
export const UserTypeEnum = Object.values(userTypes);
