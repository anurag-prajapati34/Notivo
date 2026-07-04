import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    Clock,
    RefreshCw,
    Send,
    TrendingUp,
    XCircle,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAnalyticsStatsApi } from "../apis/analytics.api"
import EmailChart from "../components/EmailChart"
import { EmailTableHeader } from "../components/EmailTableHeader"
import { EmailTableRow } from "../components/EmailTableRow"
import EmailTemplateUsageChart from "../components/EmailTemplateUsageChart"
import type { AnalyticsStats } from "../types"
import {
    parseAnalyticsOverviewObject,
    parseAnalyticsTemplateUsageData,
} from "../utils/analytics-helpers"

// ─── Stat card config ─────────────────────────────────────────────────────────

const statConfig = [
    {
        key: "Total Sent",
        icon: Send,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
        valueColor: "text-gray-900",
        percentColor: "text-blue-600",
        percentBg: "bg-blue-50",
    },
    {
        key: "Delivered",
        icon: CheckCircle2,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-500",
        valueColor: "text-emerald-700",
        percentColor: "text-emerald-600",
        percentBg: "bg-emerald-50",
    },
    {
        key: "Failed",
        icon: XCircle,
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
        valueColor: "text-red-700",
        percentColor: "text-red-600",
        percentBg: "bg-red-50",
    },
    {
        key: "Pending",
        icon: Clock,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-500",
        valueColor: "text-amber-700",
        percentColor: "text-amber-600",
        percentBg: "bg-amber-50",
    },
]

// ─── Stat card ────────────────────────────────────────────────────────────────

const StatCard = ({
    emailStatus,
    count,
    percentage,
}: {
    emailStatus: string
    count: number
    percentage: number
}) => {
    const cfg = statConfig.find(
        (s) => s.key.toLowerCase() === emailStatus.toLowerCase()
    ) ?? statConfig[0]

    const Icon = cfg.icon

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">{emailStatus}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.iconBg}`}>
                    <Icon size={15} className={cfg.iconColor} />
                </div>
            </div>
            <div>
                <p className={`text-3xl font-bold ${cfg.valueColor}`}>{count}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${cfg.percentBg} ${cfg.percentColor}`}>
                        {percentage}%
                    </span>
                    <span className="text-xs text-gray-400">of total</span>
                </div>
            </div>
        </div>
    )
}

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader = ({
    icon: Icon,
    title,
    action,
}: {
    icon: React.ElementType
    title: string
    action?: React.ReactNode
}) => (
    <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <Icon size={15} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        </div>
        {action}
    </div>
)

// ─── Loading skeleton ─────────────────────────────────────────────────────────

const SkeletonCard = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
        </div>
        <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-24 bg-gray-100 rounded" />
    </div>
)

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const Dashboard = () => {
    const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    const fetchStats = async () => {
        setIsLoading(true)
        try {
            const response = await getAnalyticsStatsApi()
            setAnalyticsStats(response.data)
        } catch (err) {
            console.error("Failed to fetch analytics", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchStats()
    }, [])

    const overviewItems = analyticsStats
        ? parseAnalyticsOverviewObject(analyticsStats.overview)
        : []

    const templateUsageData = parseAnalyticsTemplateUsageData(
        analyticsStats?.templateUsage ?? []
    )

    // Greeting based on time
    const hour = new Date().getHours()
    const greeting =
        hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

    return (
        <main>
            <div >

                {/* ── Page header ── */}
                <div className="flex items-center justify-between mb-7">
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">{greeting} 👋</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Here's what's happening with your notifications
                        </p>
                    </div>
                    <button
                        onClick={fetchStats}
                        className="h-9 px-3 bg-white border border-gray-200 rounded-lg flex items-center gap-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                </div>

                {/* ── Stat cards ── */}
                <div className="grid grid-cols-4 gap-4 mb-7">
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                        : overviewItems.map((item) => (
                            <StatCard
                                key={item.emailStatus}
                                emailStatus={item.emailStatus}
                                count={item.count}
                                percentage={Number(item.percentage)}
                            />
                        ))}
                </div>

                {/* ── Charts row ── */}
                <div className="grid grid-cols-3 gap-4 mb-7">

                    {/* Area chart — 2/3 width */}
                    <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5">
                        <SectionHeader icon={BarChart3} title="Email volume — last 7 days" />
                        <EmailChart data={analyticsStats?.last7Days ?? []} />
                    </div>

                    {/* Pie chart — 1/3 width */}
                    <div className="col-span-1 bg-white border border-gray-200 rounded-xl p-5">
                        <SectionHeader icon={TrendingUp} title="Template usage" />
                        <EmailTemplateUsageChart data={templateUsageData} />
                    </div>
                </div>

                {/* ── Recent emails ── */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <SectionHeader
                            icon={Send}
                            title="Recent emails"
                            action={
                                <button
                                    onClick={() => navigate("/emails")}
                                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                                >
                                    View all
                                    <ArrowRight size={12} />
                                </button>
                            }
                        />
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw size={18} className="animate-spin text-gray-300" />
                        </div>
                    ) : !analyticsStats?.recentEmails?.length ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Send size={20} className="text-gray-300 mb-2" />
                            <p className="text-sm text-gray-400">No emails sent yet</p>
                            <p className="text-xs text-gray-300 mt-1">
                                Emails sent via the API will appear here
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <EmailTableHeader />
                            <tbody className="divide-y divide-gray-50">
                                {analyticsStats.recentEmails.map((email, index) => (
                                    <EmailTableRow
                                        key={email.emailId ?? index}
                                        email={email}
                                        onView={() => { }}
                                        onClick={() => navigate(`/emails/${email.emailId}`)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ── Footer spacer ── */}
                <div className="h-8" />
            </div>
        </main>
    )
}