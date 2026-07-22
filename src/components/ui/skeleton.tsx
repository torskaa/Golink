import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-bg-emphasis', className)}
      {...props}
    />
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-default p-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-8 w-32" />
      <Skeleton className="mt-2 h-3 w-16" />
    </div>
  )
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="border-b border-border-default">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  )
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-border-subtle bg-bg-default p-6">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-4 h-[300px] w-full rounded-lg" />
    </div>
  )
}
