// ─── pages/Emails.tsx ────────────────────────────────────────────────────────

import { AlertCircle } from "lucide-react";
import type { Email } from "../types";
import { convertToIndianDate } from "../utils/date-helpers";
import { formatTemplateSlug } from "../utils/name-helpers";



// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
    const s = status?.toLowerCase();

    const styles: Record<string, string> = {
        sent: "bg-emerald-50 text-emerald-700 border-emerald-200",
        delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
        failed: "bg-red-50 text-red-700 border-red-200",
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        retrying: "bg-orange-50 text-orange-700 border-orange-200",
        processing: "bg-blue-50 text-blue-700 border-blue-200",
    };

    const dots: Record<string, string> = {
        sent: "bg-emerald-500",
        delivered: "bg-emerald-500",
        failed: "bg-red-500",
        pending: "bg-amber-500",
        retrying: "bg-orange-500",
        processing: "bg-blue-500",
    };

    const cls = styles[s] ?? "bg-gray-50 text-gray-600 border-gray-200";
    const dot = dots[s] ?? "bg-gray-400";

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border text-xs font-medium ${cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
            {status?.toUpperCase()}
        </span>
    );
};



// ─── Attempts indicator ───────────────────────────────────────────────────────

const AttemptsIndicator = ({ attempts, status }: { attempts: number | null; status: string }) => {
    const count = attempts ?? 0;
    const isFailed = status?.toLowerCase() === "failed";

    if (count === 0) return <span className="text-gray-400 text-xs">—</span>;

    return (
        <span className={`text-xs font-medium ${isFailed && count >= 3 ? "text-red-600" : "text-gray-600"}`}>
            {count}/3
            {isFailed && count >= 3 && (
                <span className="ml-1 text-red-400">(exhausted)</span>
            )}
        </span>
    );
};
export const EmailTableRow = ({
    email,
    // onView,
    onClick,
}: {
    email: Email;
    onView: () => void;
    onClick: () => void;
}) => {
    const isFailed = email.emailStatus?.toLowerCase() === "failed";

    return (
        <tr onClick={onClick} className="hover:bg-gray-50 transition-colors group hover:cursor-pointer">
            {/* Recipient */}
            <td className="px-5 py-3.5">
                <span className="text-sm text-gray-900 font-medium">{email.toEmail}</span>
            </td>

            {/* Subject */}
            <td className="px-4 py-3.5 max-w-[220px]">
                <span className="text-sm text-gray-700 truncate block" title={email.subject ?? ""}>
                    {email.subject ?? "—"}
                </span>
            </td>

            {/* Template */}
            <td className="px-4 py-3.5">
                <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                    {formatTemplateSlug(email.templateId)}
                </span>
            </td>

            {/* Status */}
            <td className="px-4 py-3.5">
                <div className="flex flex-col gap-1">
                    <StatusBadge status={email.emailStatus ?? "unknown"} />
                    {isFailed && email.lastErrorMessage && (
                        <div className="flex items-center gap-1 mt-0.5">
                            <AlertCircle size={10} className="text-red-400 shrink-0" />
                            <span
                                className="text-xs text-red-500 truncate max-w-[160px]"
                                title={email.lastErrorMessage}
                            >
                                {email.lastErrorMessage}
                            </span>
                        </div>
                    )}
                </div>
            </td>

            {/* Attempts */}
            <td className="px-4 py-3.5">
                <AttemptsIndicator
                    attempts={email.attempts}
                    status={email.emailStatus ?? ""}
                />
            </td>

            {/* Sent at */}
            <td className="px-4 py-3.5">
                <span className="text-xs text-gray-600">
                    {convertToIndianDate(email.createdAt)}
                </span>
            </td>

            {/* Delivered at */}
            <td className="px-4 py-3.5">
                <span className="text-xs text-gray-600">
                    {email.deliveredAt ? convertToIndianDate(email.deliveredAt) : '-'}
                </span>
            </td>

            {/* View button */}
            {/* <td className="px-4 py-3.5">
                <button
                    onClick={onView}
                    className="opacity-0 group-hover:opacity-100 h-8 px-3 bg-white border border-gray-200 rounded-lg flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-all"
                >
                    <Eye size={12} />
                    View
                </button>
            </td> */}
        </tr>
    );
};