import EmailChart from "../components/EmailChart";
import EmailTemplateUsageChart from "../components/EmailTemplateUsageChart";

export const Dashboard = () => {

    const emailDistributions = [
        {
            emailStatus: "Total Sent",
            count: 900,
            percentage: "100"
        },
        {
            emailStatus: "Pending",
            count: 120,
            percentage: "15"
        },
        {
            emailStatus: "Delivered",
            count: 600,
            percentage: "75"
        },
        {
            emailStatus: "Failed",
            count: 80,
            percentage: "10"
        },
    ];

    // const emailSentOverTime = [
    //     {
    //         date: "2023-06-01",
    //         count: 900,
    //     },
    //     {
    //         date: "2023-06-02",
    //         count: 120,
    //     },
    //     {
    //         date: "2023-06-03",
    //         count: 600,
    //     },
    //     {
    //         date: "2023-06-04",
    //         count: 80,
    //     },
    // ];

    const templateData = [
        { name: "Template 1", value: 400 },
        { name: "Template 2", value: 300 },
        { name: "Template 3", value: 300 },
    ];

    const recentEmails = [
        {
            subject: "Subject 1",
            date: "2023-06-01",
            emailStatus: "Delivered"
        },
        {
            subject: "Subject 2",
            date: "2023-06-02",
            emailStatus: "Failed"
        },
        {
            subject: "Subject 3",
            date: "2023-06-03",
            emailStatus: "Pending"
        },
    ]
    return (
        <main>
            <div className="w-full h-full rounded-md flex  text-2xl font-semibold">Overview</div>

            <br />
            {/**Total Send, Total Failed, Total Delivered, Pending */}
            <div className="w-full h-full rounded-md flex  text-lg font-semibold mb-2">Email Distributions</div>
            <div className="grid grid-cols-4 gap-4">
                {
                    emailDistributions.map((item) => {
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
                <EmailChart />
                <EmailTemplateUsageChart data={templateData ?? []} />
            </div>

            <br />
            <div className="w-full h-full rounded-md flex  text-lg font-semibold mb-2">Recent Emails</div>
            <div className="grid grid-cols-1 gap-2">
                <div className="border border-gray-600 rounded-md bg-white p-2  shadow-2xs grid grid-cols-3 gap-4 text-start">
                    <p className="rounded-md text-lg font-semibold">Subject</p>
                    <p className="rounded-md font-semibold">Date</p>
                    <p className="rounded-md font-semibold">Status</p>
                </div>
                {

                    recentEmails.map((item) => {
                        return (
                            <div className="border border-gray-50 rounded-md bg-white p-2  shadow-2xs grid grid-cols-3 gap-4 text-start">
                                <p className="rounded-md text-lg ">{item.subject}</p>
                                <p className="rounded-md">{item.date}</p>
                                <p className="rounded-md">{item.emailStatus}</p>
                            </div>
                        )
                    })

                }
            </div>


        </main>
    )
}