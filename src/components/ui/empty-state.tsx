import { cn } from '@/lib/utils'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16', className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle bg-bg-subtle">
        {icon || <Inbox className="h-5 w-5 text-content-subtle" />}
      </div>
      <h3 className="text-sm font-medium text-content-emphasis">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-content-subtle">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
