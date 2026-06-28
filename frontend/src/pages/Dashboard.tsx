import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAnalyticsStatsApi } from "../apis/analytics.api";
import { EamilCard } from "../components/EmailCard";
import EmailChart from "../components/EmailChart";
import EmailTemplateUsageChart from "../components/EmailTemplateUsageChart";
import type { AnalyticsStats } from "../types";
import { parseAnalyticsOverviewObject, parseAnalyticsTemplateUsageData } from "../utils/analytics-helpers";

export const Dashboard = () => {

    const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchAnalyticsStats = async () => {
            const response = await getAnalyticsStatsApi();
            setAnalyticsStats(response.data);
        };
        fetchAnalyticsStats();
    }, []);



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

            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Recipient</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Subject</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Template</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Attempts</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Sent at</th>
                        <th className="text-left text-xs font-medium text-gray-500 px-4 py-3"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {analyticsStats && analyticsStats.recentEmails.map((email, index) => (
                        <EamilCard
                            key={email.emailId ?? index}
                            email={email}
                            onView={() => () => { }}
                            onClick={() => { navigate(`/email/${email.emailId}`) }}
                        />
                    ))}
                </tbody>
            </table>


        </main >
    )
}