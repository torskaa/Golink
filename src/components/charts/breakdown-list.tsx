interface BreakdownItem {
  name: string
  value: number
}

interface BreakdownListProps {
  title: string
  items: BreakdownItem[]
  maxValue: number
  formatValue?: (val: number) => string
}

export function BreakdownList({ items, maxValue, formatValue }: BreakdownListProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
        return (
          <div key={item.name} className="relative flex items-center justify-between py-1.5">
            <div
              className="absolute left-0 top-0 h-full rounded-md bg-bg-bg-subtletransition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
            <span className="relative z-10 flex items-center gap-2 pl-2 text-sm text-content-subtle">
              {item.name}
            </span>
            <span className="relative z-10 text-sm font-medium text-content-emphasis">
              {formatValue ? formatValue(item.value) : item.value.toLocaleString()}
            </span>
          </div>
        )
      })}
    </div>
  )
}
