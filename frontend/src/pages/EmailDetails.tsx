// ─── pages/LogDetail.tsx ─────────────────────────────────────────────────────

import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    Clock,
    Hash,
    Layers,
    Mail,
    RefreshCw,
    RotateCcw,
    Send,
    Timer,
    XCircle,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import type { EmailAttempt, EmailDetail } from "../types"
import { getEmailDetailApi } from "../apis/email.api"
import { EmailPreviewModal } from "../components/EmailPreviewModal"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDateTime = (date: string | Date | null | undefined): string => {
    if (!date) return "—"
    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    })
}

const timeBetween = (a: string, b: string): string => {
    const ms = Math.abs(new Date(b).getTime() - new Date(a).getTime())
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
}

const formatSlug = (slug: string | null | undefined): string => {
    if (!slug) return "—"
    return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig = {
    delivered: {
        label: "Delivered",
        icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
    },
    sent: {
        label: "Sent",
        icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
    },
    failed: {
        label: "Failed",
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
        dot: "bg-red-500",
    },
    retrying: {
        label: "Retrying",
        icon: RotateCcw,
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
        dot: "bg-orange-500",
    },
    pending: {
        label: "Pending",
        icon: Clock,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
        dot: "bg-amber-500",
    },
    processing: {
        label: "Processing",
        icon: RefreshCw,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        dot: "bg-blue-500",
    },
}

const getStatusConfig = (status: string) =>
    statusConfig[status?.toLowerCase() as keyof typeof statusConfig] ??
    statusConfig.pending

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({
    status,
    size = "sm",
}: {
    status: string
    size?: "sm" | "lg"
}) => {
    const cfg = getStatusConfig(status)
    const Icon = cfg.icon

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border font-medium
        ${cfg.bg} ${cfg.border} ${cfg.color}
        ${size === "lg" ? "text-sm px-4 py-1.5" : "text-xs"}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    )
}

// ─── Meta info card ───────────────────────────────────────────────────────────

const MetaCard = ({
    icon: Icon,
    label,
    value,
    subValue,
    valueClass = "text-gray-900",
}: {
    icon: React.ElementType
    label: string
    value: string
    subValue?: string
    valueClass?: string
}) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <Icon size={14} className="text-gray-500" />
            </div>
            <span className="text-xs font-medium text-gray-500">{label}</span>
        </div>
        <div>
            <p className={`text-sm font-semibold ${valueClass}`}>{value}</p>
            {subValue && <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>}
        </div>
    </div>
)

// ─── Attempt timeline item ────────────────────────────────────────────────────

const AttemptTimelineItem = ({
    attempt,
    isLast,
    prevAttempt,
    maxAttempts,
}: {
    attempt: EmailAttempt
    isLast: boolean
    prevAttempt: EmailAttempt | null
    maxAttempts: number
}) => {
    const isSuccess = ["delivered", "sent"].includes(
        attempt.emailStatus?.toLowerCase() ?? ""
    )
    const waitTime =
        prevAttempt && !isSuccess
            ? timeBetween(prevAttempt.attemptedAt, attempt.attemptedAt)
            : null

    return (
        <div className="flex gap-4">
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
                <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10
            ${isSuccess
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-red-400 bg-red-50"
                        }`}
                >
                    {isSuccess ? (
                        <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                        <XCircle size={16} className="text-red-500" />
                    )}
                </div>
                {!isLast && (
                    <div className="w-px flex-1 bg-gray-200 mt-1 mb-1 min-h-[40px]" />
                )}
            </div>

            {/* Attempt content */}
            <div className={`flex-1 pb-8 ${isLast ? "pb-0" : ""}`}>
                <div
                    className={`rounded-xl border p-4 ${isSuccess
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-red-50 border-red-200"
                        }`}
                >
                    {/* Attempt header */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span
                                className={`text-sm font-semibold ${isSuccess ? "text-emerald-800" : "text-red-800"
                                    }`}
                            >
                                Attempt {attempt.attemptNumber}
                                {attempt.attemptNumber === maxAttempts && !isSuccess && (
                                    <span className="ml-2 text-xs font-normal text-red-600">
                                        (final attempt — all retries exhausted)
                                    </span>
                                )}
                            </span>
                        </div>
                        <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-md ${isSuccess
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                                }`}
                        >
                            {isSuccess ? "SUCCESS" : "FAILED"}
                        </span>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 mb-3">
                        <Clock
                            size={12}
                            className={isSuccess ? "text-emerald-600" : "text-red-500"}
                        />
                        <span
                            className={`text-xs ${isSuccess ? "text-emerald-700" : "text-red-700"
                                }`}
                        >
                            {formatDateTime(attempt.attemptedAt)}
                        </span>
                    </div>

                    {/* Error message if failed */}
                    {!isSuccess && attempt.errorMessage && (
                        <div className="flex gap-2 bg-red-100 border border-red-200 rounded-lg px-3 py-2.5 mb-3">
                            <AlertTriangle
                                size={13}
                                className="text-red-500 shrink-0 mt-0.5"
                            />
                            <div>
                                <p className="text-xs font-medium text-red-700 mb-0.5">
                                    Error
                                </p>
                                <p className="text-xs text-red-600 font-mono leading-relaxed">
                                    {attempt.errorMessage}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Wait before next retry */}
                    {!isLast && !isSuccess && (
                        <div className="flex items-center gap-2 mt-2">
                            <RotateCcw size={11} className="text-orange-500" />
                            <span className="text-xs text-orange-600 font-medium">
                                Retrying with exponential backoff...
                            </span>
                        </div>
                    )}

                    {/* Success message */}
                    {isSuccess && (
                        <div className="flex items-center gap-2 mt-1">
                            <Send size={11} className="text-emerald-600" />
                            <span className="text-xs text-emerald-700 font-medium">
                                Email delivered to recipient's inbox
                            </span>
                        </div>
                    )}
                </div>

                {/* Wait time between attempts */}
                {!isLast && waitTime && (
                    <div className="flex items-center gap-2 my-3 ml-2">
                        <Timer size={11} className="text-gray-400" />
                        <span className="text-xs text-gray-500">
                            Waited {waitTime} before next attempt (exponential backoff)
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export const EmailDetails = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [data, setData] = useState<EmailDetail | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showEmailPreview, setShowEmailPreview] = useState(false)

    useEffect(() => {
        if (!id) return
        const fetch = async () => {
            setIsLoading(true)
            try {
                const res = await getEmailDetailApi(parseInt(id))
                setData(res.data)
            } catch (err) {
                console.error("Failed to fetch log detail", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetch()
    }, [id])

    if (isLoading) {
        return (
            <main>
                <RefreshCw size={20} className="animate-spin text-gray-400" />
            </main>
        )
    }

    if (!data) {
        return (
            <main >
                <XCircle size={32} className="text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">Email log not found</p>
                <button
                    onClick={() => navigate("/emails")}
                    className="mt-4 text-sm text-indigo-600 hover:underline"
                >
                    Back to emails
                </button>
            </main>
        )
    }

    const { email, attempts, meta } = data
    const statusCfg = getStatusConfig(email.emailStatus ?? "")
    const isFailed = email.emailStatus?.toLowerCase() === "failed"
    const isDelivered = ["delivered", "sent"].includes(
        email.emailStatus?.toLowerCase() ?? ""
    )

    return (
        <main >
            <div >

                {/* Back button */}
                <button
                    onClick={() => navigate("/emails")}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
                >
                    <ArrowLeft size={15} />
                    Back to emails
                </button>

                {/* Page header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-lg font-medium text-gray-900">
                                Email Log
                            </h1>
                            <ChevronRight size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-500 font-mono">
                                #{email.emailId}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">
                            Sent to{" "}
                            <span className="font-medium text-gray-700">{email.toEmail}</span>
                        </p>
                    </div>
                    <StatusBadge status={email.emailStatus ?? ""} size="lg" />
                </div>

                {/* ── Meta cards row ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <MetaCard
                        icon={Mail}
                        label="Recipient"
                        value={email.toEmail ?? "—"}
                    />
                    <MetaCard
                        icon={Hash}
                        label="Template"
                        value={formatSlug(email.templateId)}
                        subValue={email.templateId ?? undefined}
                    />
                    <MetaCard
                        icon={Layers}
                        label="Attempts"
                        value={`${meta.totalAttempts} / 3`}
                        valueClass={
                            meta.totalAttempts >= 3 && isFailed
                                ? "text-red-600"
                                : "text-gray-900"
                        }
                        subValue={
                            meta.totalAttempts >= 3 && isFailed
                                ? "All retries exhausted"
                                : meta.totalAttempts === 1
                                    ? "Delivered first try"
                                    : `${meta.totalAttempts - 1} retr${meta.totalAttempts === 2 ? "y" : "ies"}`
                        }
                    />
                    <MetaCard
                        icon={Timer}
                        label="Delivery time"
                        value={
                            meta.deliveryTimeSeconds
                                ? `${meta.deliveryTimeSeconds}s`
                                : "—"
                        }
                        subValue={isDelivered ? "From queue to inbox" : undefined}
                    />
                </div>

                {/* ── Two column layout ── */}
                <div className="grid grid-cols-3 gap-5">

                    {/* Left — Timeline (2/3 width) */}
                    <div className="col-span-2">
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <RotateCcw size={15} className="text-gray-500" />
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Retry Timeline
                                </h2>
                                <span className="ml-auto text-xs text-gray-400">
                                    Max 3 attempts · Exponential backoff
                                </span>
                            </div>

                            {attempts.length === 0 ? (
                                <div className="flex flex-col items-center py-10 text-center">
                                    <Clock size={20} className="text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-400">
                                        No attempts recorded yet
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Job may still be pending in queue
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    {attempts.map((attempt, idx) => (
                                        <AttemptTimelineItem
                                            key={attempt.attemptId}
                                            attempt={attempt}
                                            isLast={idx === attempts.length - 1}
                                            prevAttempt={idx > 0 ? attempts[idx - 1] : null}
                                            maxAttempts={3}
                                        />
                                    ))}

                                    {/* Final result banner */}
                                    <div
                                        className={`mt-4 flex items-center gap-3 rounded-xl border px-4 py-3 ${isDelivered
                                            ? "bg-emerald-50 border-emerald-200"
                                            : isFailed
                                                ? "bg-red-50 border-red-200"
                                                : "bg-amber-50 border-amber-200"
                                            }`}
                                    >
                                        {isDelivered ? (
                                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                        ) : isFailed ? (
                                            <XCircle size={16} className="text-red-500 shrink-0" />
                                        ) : (
                                            <Clock size={16} className="text-amber-500 shrink-0" />
                                        )}
                                        <div>
                                            <p
                                                className={`text-xs font-semibold ${isDelivered
                                                    ? "text-emerald-800"
                                                    : isFailed
                                                        ? "text-red-800"
                                                        : "text-amber-800"
                                                    }`}
                                            >
                                                {isDelivered
                                                    ? "Successfully delivered"
                                                    : isFailed
                                                        ? "Delivery failed — all 3 attempts exhausted"
                                                        : "Delivery in progress"}
                                            </p>
                                            <p
                                                className={`text-xs mt-0.5 ${isDelivered
                                                    ? "text-emerald-700"
                                                    : isFailed
                                                        ? "text-red-600"
                                                        : "text-amber-700"
                                                    }`}
                                            >
                                                {isDelivered
                                                    ? `Delivered at ${formatDateTime(email.deliveredAt)}`
                                                    : isFailed
                                                        ? email.lastErrorMessage ?? "Unknown error"
                                                        : "Worker is processing this job"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right — Details sidebar (1/3 width) */}
                    <div className="col-span-1 flex flex-col gap-4">

                        {/* Email details */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                                Email Details
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">To</p>
                                    <p className="text-sm text-gray-900 font-medium break-all">
                                        {email.toEmail}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Subject</p>
                                    <p className="text-sm text-gray-900">{email.subject}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Template</p>
                                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                        {email.templateId ?? "—"}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Status</p>
                                    <StatusBadge status={email.emailStatus ?? ""} />
                                </div>
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                                Timestamps
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Queued at</p>
                                    <p className="text-xs text-gray-700">
                                        {formatDateTime(email.queuedAt ?? email.createdAt)}
                                    </p>
                                </div>

                                {email.deliveredAt && (
                                    <div>
                                        <p className="text-xs text-gray-400 mb-0.5">Delivered at</p>
                                        <p className="text-xs text-gray-700">
                                            {formatDateTime(email.deliveredAt)}
                                        </p>
                                    </div>
                                )}

                                {meta.deliveryTimeSeconds && (
                                    <div>
                                        <p className="text-xs text-gray-400 mb-0.5">
                                            Total delivery time
                                        </p>
                                        <p className="text-xs font-semibold text-emerald-600">
                                            {meta.deliveryTimeSeconds}s
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Queue info */}
                        {/* <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
                                Queue Info
                            </h3>
                            <div className="space-y-2.5">
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-400">Queue</span>
                                    <span className="text-xs font-mono text-gray-600">
                                        notification-emails
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-400">Max attempts</span>
                                    <span className="text-xs text-gray-600">3</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-400">Backoff type</span>
                                    <span className="text-xs text-gray-600">Exponential</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-400">Base delay</span>
                                    <span className="text-xs text-gray-600">30s</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-400">Concurrency</span>
                                    <span className="text-xs text-gray-600">3 workers</span>
                                </div>
                            </div>
                        </div> */}

                        {/* Email preview button */}
                        <button
                            onClick={() => setShowEmailPreview(true)}
                            className="w-full h-9 flex items-center justify-center gap-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            <Mail size={14} />
                            Preview email body
                        </button>
                    </div>
                </div>
            </div>

            {/* Email body preview modal */}
            {showEmailPreview && (
                <EmailPreviewModal
                    email={email}
                    onClose={() => setShowEmailPreview(false)}
                />
            )}
        </main>
    )
}