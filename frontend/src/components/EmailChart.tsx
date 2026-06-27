import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

// Data from your API
const data = [
    { date: 'Mon', delivered: 35, failed: 2, total: 37 },
    { date: 'Tue', delivered: 42, failed: 5, total: 47 },
    { date: 'Wed', delivered: 28, failed: 1, total: 29 },
    { date: 'Thu', delivered: 50, failed: 3, total: 53 },
    { date: 'Fri', delivered: 38, failed: 4, total: 38 },
    { date: 'Sat', delivered: 20, failed: 0, total: 20 },
    { date: 'Sun', delivered: 15, failed: 1, total: 16 },
]

const EmailChart = () => (
    <ResponsiveContainer width="100%" height={300}>
        <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
            <defs>
                {/* Green gradient for delivered */}
                <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>

                {/* Red gradient for failed */}
                <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>

                {/* Blue gradient for total */}
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0000FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0000FF" stopOpacity={0} />
                </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />

            <XAxis
                dataKey="date"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
            />

            <YAxis
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={30}
            />

            <Tooltip
                contentStyle={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f9fafb'
                }}
            />

            {/* Delivered — green */}
            <Area
                type="monotone"
                dataKey="delivered"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorDelivered)"
                animationDuration={1000}
            />

            {/* Failed — red */}
            <Area
                type="monotone"
                dataKey="failed"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#colorFailed)"
                animationDuration={1000}
            />

            {/* Total — blue */}
            <Area
                type="monotone"
                dataKey="total"
                stroke="#0000FF"
                strokeWidth={2}
                fill="url(#colorTotal)"
                animationDuration={1000}
            />
        </AreaChart>
    </ResponsiveContainer>
)

export default EmailChart