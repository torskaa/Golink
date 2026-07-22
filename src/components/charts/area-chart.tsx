'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TimeseriesData {
  date: string
  clicks: number
}

interface AreaChartWidgetProps {
  data: TimeseriesData[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border-default bg-bg-default/80 px-4 py-3 shadow-xl backdrop-blur-md">
      <p className="text-sm text-content-subtle">{label}</p>
      <p className="text-lg font-bold text-content-emphasis">
        {payload[0].value.toLocaleString()} clicks
      </p>
    </div>
  )
}

export function AnalyticsAreaChart({ data }: AreaChartWidgetProps) {
  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => {
              const date = new Date(val)
              return `${date.getHours()}:00`
            }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="clicks"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#clickGradient)"
            activeDot={{ r: 6, fill: '#2563eb', stroke: '#0b0b0f', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
