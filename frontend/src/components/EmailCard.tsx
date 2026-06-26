import type { Email } from "../types";

type Props = {
    email: Email;
    onView: (email: Email) => void;
};

export function EmailCard({ email, onView }: Props) {
    const preview =
        email.body
            ?.replace(/<[^>]+>/g, "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 120) ?? "";

    return (
        <div className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${email.emailStatus === "SENT"
                        ? "bg-green-100 text-green-700"
                        : email.emailStatus === "FAILED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                >
                    {email.emailStatus}
                </span>

                <span className="text-xs text-gray-400">
                    {email.templateId}
                </span>
            </div>

            <div className="mt-4 space-y-2">
                <p>
                    <span className="font-semibold">To:</span>{" "}
                    {email.toEmail}
                </p>

                <p>
                    <span className="font-semibold">Subject:</span>{" "}
                    {email.subject}
                </p>

                <p className="text-sm text-gray-600">
                    {preview}...
                </p>
            </div>

            <button
                onClick={() => onView(email)}
                className="mt-5 rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
            >
                View Email
            </button>
        </div>
    );
}