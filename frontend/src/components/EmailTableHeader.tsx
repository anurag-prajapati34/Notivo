

export const EmailTableHeader = () => {
    return (
        <thead>
            <tr className="border-y border-gray-400 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Recipient</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 py-3 hidden sm:table-cell">Subject</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 py-3 hidden md:table-cell">Template</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 py-3 hidden lg:table-cell">Attempts</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 py-3 hidden sm:table-cell">Sent at</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 py-3 hidden xl:table-cell">Scheduled at</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 py-3 hidden xl:table-cell">Delivered at</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 py-3"></th>
            </tr>
        </thead>
    )
}