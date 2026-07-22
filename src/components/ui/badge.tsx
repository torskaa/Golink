import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-bg-subtle text-content-emphasis shadow',
        success: 'border-transparent bg-emerald-500/10 text-emerald-500',
        warning: 'border-transparent bg-yellow-500/10 text-yellow-500',
        destructive: 'border-transparent bg-error/10 text-error',
        secondary: 'border-border-default bg-bg-muted text-content-subtle',
        outline: 'text-content-emphasis',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
