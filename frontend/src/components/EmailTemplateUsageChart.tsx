import {
    Pie,
    PieChart,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

// Colors for each template slice
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

const RADIAN = Math.PI / 180

// Percentage label inside each slice
const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
}: any) => {
    if (percent < 0.05) return null  // skip label if slice too small

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN)
    const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN)

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={600}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    )
}

// Your data comes from API — this is the shape
interface TemplateUsage {
    name: string
    value: number
}

interface Props {
    data: TemplateUsage[]
}

const EmailTemplateUsageChart = ({ data }: Props) => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"        // which key has the numbers
                    nameKey="name"         // which key has the labels
                    cx="50%"               // center x
                    cy="50%"               // center y
                    outerRadius={100}      // size of the pie
                    labelLine={false}      // no lines from slice to label
                    label={renderCustomizedLabel}
                    animationDuration={800}
                >
                    {/* Each slice gets its own color via Cell */}
                    {data.map((_, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                        />
                    ))}
                </Pie>

                {/* Hover popup */}
                <Tooltip
                    formatter={(value: number, name: string) => [value, name]}
                    contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f9fafb',
                        fontSize: '13px'
                    }}
                />

                {/* Legend below the chart */}
                <Legend
                    formatter={(value) => (
                        <span style={{ color: '#9ca3af', fontSize: '12px' }}>{value}</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}

export default EmailTemplateUsageChart