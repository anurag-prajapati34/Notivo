// ─── pages/Emails.tsx ────────────────────────────────────────────────────────

import { Mail, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmailsListApi } from "../apis/email.api";
import { EmailPreviewModal } from "../components/EmailPreviewModal";
import { EmailTableHeader } from "../components/EmailTableHeader";
import { EmailTableRow } from "../components/EmailTableRow";
import type { Email } from "../types";


// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = ({ filtered }: { filtered: boolean }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Mail size={20} className="text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-700 mb-1">
            {filtered ? "No emails match your filters" : "No emails sent yet"}
        </p>
        <p className="text-xs text-gray-400 max-w-xs">
            {filtered
                ? "Try adjusting your search or status filter."
                : "Emails sent via the Notivo API will appear here."}
        </p>
    </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "sent" | "delivered" | "failed" | "pending" | "retrying";

export const Emails = () => {
    const [emails, setEmails] = useState<Email[]>([]);
    const navigate = useNavigate();
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    const fetchEmails = async () => {
        setIsLoading(true);
        try {
            const response = await getEmailsListApi();
            setEmails(response.data);
        } catch (err) {
            console.error("Failed to fetch emails", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    // ── Filter logic ──
    const filtered = emails.filter((e) => {
        const matchesSearch =
            searchQuery.trim() === "" ||
            e.toEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.subject?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === "all" ||
            e.emailStatus?.toLowerCase() === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // ── Status counts for filter tabs ──
    const counts = {
        all: emails.length,
        sent: emails.filter((e) => ["sent", "delivered"].includes(e.emailStatus?.toLowerCase() ?? "")).length,
        failed: emails.filter((e) => e.emailStatus?.toLowerCase() === "failed").length,
        pending: emails.filter((e) => e.emailStatus?.toLowerCase() === "pending").length,
        retrying: emails.filter((e) => e.emailStatus?.toLowerCase() === "retrying").length,
        delivered: emails.filter((e) => e.emailStatus?.toLowerCase() === "delivered").length,
    };

    const filterTabs: { key: StatusFilter; label: string }[] = [
        { key: "all", label: "All" },
        { key: "delivered", label: "Delivered" },
        { key: "failed", label: "Failed" },
        { key: "pending", label: "Pending" },
        { key: "retrying", label: "Retrying" },
    ];

    return (
        <main >
            <div className="">

                {/* ── Page header ── */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-lg font-medium text-gray-900">Sent Emails</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {emails.length} total email{emails.length !== 1 ? "s" : ""} sent
                        </p>
                    </div>
                    <button
                        onClick={fetchEmails}
                        className="h-9 px-3 bg-white border border-gray-200 rounded-lg flex items-center gap-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                {/* ── Filters row ── */}
                <div className="flex items-center gap-3 mb-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-xs">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by recipient or subject..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-9 pl-8 pr-3 text-sm bg-white border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                    </div>

                    {/* Status filter tabs */}
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setStatusFilter(tab.key)}
                                className={`h-7 px-3 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${statusFilter === tab.key
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-500 hover:text-gray-800"
                                    }`}
                            >
                                {tab.label}
                                <span className={`text-xs ${statusFilter === tab.key ? "text-gray-400" : "text-gray-400"}`}>
                                    {counts[tab.key]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <RefreshCw size={18} className="animate-spin text-gray-400" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <EmptyState filtered={searchQuery !== "" || statusFilter !== "all"} />
                    ) : (
                        <table className="w-full">
                            <EmailTableHeader />
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((email, index) => (
                                    <EmailTableRow
                                        key={email.emailId ?? index}
                                        email={email}
                                        onView={() => setSelectedEmail(email)}
                                        onClick={() => navigate(`/emails/${email.emailId}`)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ── Result count ── */}
                {!isLoading && filtered.length > 0 && (
                    <p className="text-xs text-gray-400 mt-3">
                        Showing {filtered.length} of {emails.length} emails
                    </p>
                )}
            </div>

            {/* ── Preview modal ── */}
            {selectedEmail && (
                <EmailPreviewModal
                    email={selectedEmail}
                    onClose={() => setSelectedEmail(null)}
                />
            )}
        </main>
    );
};

