import type { User } from "../types";

export const handleEmailSentViaGuestAccount = (user: User | null) => {
  if (!user) return { canSend: false, message: "User not found" };
  if (user.userType && user.userType.toLocaleLowerCase() === "guest") {
    const key = "guest_email_count";
    const guestEmailCount = Number(localStorage.getItem(key)) || 0;

    const guestEmailLimit = Number(
      import.meta.env.VITE_GUEST_EMAIL_LIMIT || "3",
    );

    if (guestEmailCount >= guestEmailLimit) {
      return {
        canSend: false,
        message: "Guest email limit reached, please create an account",
      };
    }

    localStorage.setItem(key, String(guestEmailCount + 1));
  }

  return {
    canSend: true,
    message: "",
  };
};
