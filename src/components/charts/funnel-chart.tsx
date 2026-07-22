'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'

interface FunnelData {
  name: string
  value: number
  fill: string
}

const defaultFunnel: FunnelData[] = [
  { name: 'Clicks', value: 12450, fill: '#2563eb' },
  { name: 'Leads', value: 456, fill: '#10b981' },
  { name: 'Sales', value: 89, fill: '#f59e0b' },
]

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border-default bg-bg-default/80 px-4 py-3 shadow-xl backdrop-blur-md">
      <p className="text-sm text-content-subtle">{payload[0].payload.name}</p>
      <p className="text-lg font-bold text-content-emphasis">{payload[0].value.toLocaleString()}</p>
    </div>
  )
}

export function FunnelChart({ data }: { data?: FunnelData[] }) {
  const funnelData = data || defaultFunnel
  
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={funnelData}
          layout="vertical"
          margin={{ top: 10, right: 40, left: 60, bottom: 10 }}
          barCategoryGap={16}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} minPointSize={10}>
            {funnelData.map((entry, index) => (
              <rect key={index} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(val: any) => typeof val === 'number' ? val.toLocaleString() : val}
              style={{ fill: '#9ca3af', fontSize: 12 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
