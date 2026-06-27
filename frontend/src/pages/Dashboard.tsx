import { useEffect, useState } from "react";
import { getAnalyticsStatsApi } from "../apis/analytics.api";
import EmailChart from "../components/EmailChart";
import EmailTemplateUsageChart from "../components/EmailTemplateUsageChart";
import type { AnalyticsStats } from "../types";
import { parseAnalyticsOverviewObject, parseAnalyticsTemplateUsageData } from "../utils/analytics-helpers";
import { convertToIndianDate } from "../utils/date-helpers";

export const Dashboard = () => {

    const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null);

    useEffect(() => {
        const fetchAnalyticsStats = async () => {
            const response = await getAnalyticsStatsApi();
            setAnalyticsStats(response.data);
        };
        fetchAnalyticsStats();
    }, []);


    const getColorByEmailStatus = (emailStatus: string) => {
        const normalizedEmailStatus = emailStatus.toLowerCase();
        switch (normalizedEmailStatus) {
            case "sent":
                return "#10b981"; // Dark Green

            case "failed":
                return "#ef4444"; // Dark Red

            case "pending":
                return "#f59e0b"; // Olive (dark yellowish)

            default:
                return "#6366f1"; // Very Dark Gray (instead of pure black)
        }

    }


    return (
        <main>
            <div className="w-full h-full rounded-md flex  text-2xl font-semibold">Overview</div>

            <br />
            {/**Total Send, Total Failed, Total Delivered, Pending */}
            <div className="w-full h-full rounded-md flex  text-lg font-semibold mb-2">Email Distributions</div>
            <div className="grid grid-cols-4 gap-4">
                {
                    analyticsStats && parseAnalyticsOverviewObject(analyticsStats.overview)
                        .map((item) => {
                            return (
                                <div className="border rounded-md bg-white p-2 text-center shadow-2xs">
                                    <p className="rounded-md text-lg font-semibold">{item.emailStatus}</p>
                                    <p className="rounded-md">{item.count} {`(${item.percentage}%)`}</p>
                                    {/* <p className="rounded-md">{item.percentage}</p> */}
                                </div>
                            )
                        })
                }
            </div>

            <br />

            <div className="w-full h-full rounded-md flex  text-lg font-semibold mb-2">Email Sent Over Time</div>
            <div className="grid grid-cols-2 gap-4">
                <EmailChart data={analyticsStats?.last7Days || []} />
                <EmailTemplateUsageChart data={parseAnalyticsTemplateUsageData(analyticsStats ? analyticsStats.templateUsage || [] : []) ?? []} />
            </div>

            <br />
            <div className="w-full h-full rounded-md flex  text-lg font-semibold mb-2">Recent Emails</div>
            <div className="grid grid-cols-1 gap-2">
                <div className="border border-gray-600 rounded-md bg-white p-2  shadow-2xs grid grid-cols-4 gap-4 text-start">
                    <p className="rounded-md text-lg font-semibold">Subject</p>
                    <p className="rounded-md text-lg font-semibold">Recipient</p>
                    <p className="rounded-md font-semibold">Date</p>
                    <p className="rounded-md font-semibold">Status</p>
                </div>
                {

                    analyticsStats && analyticsStats.recentEmails.map((item) => {
                        const color = getColorByEmailStatus(item.emailStatus || 'Unknown')
                        return (
                            <div className="border border-gray-50 rounded-md bg-white p-2  shadow-2xs grid grid-cols-4 gap-4 text-start">
                                <p className="rounded-md  ">{item.subject || 'Unknown'}</p>
                                <p className="rounded-md  ">{item.toEmail || 'Unknown'}</p>
                                <p className="rounded-md">{convertToIndianDate(item.date) || 'Unknown'}</p>
                                <p style={{ color: color }} className={`rounded-md  font-semibold`}>{item.emailStatus || 'Unknown'}</p>
                            </div>
                        )
                    })

                }
            </div>


        </main >
    )
}