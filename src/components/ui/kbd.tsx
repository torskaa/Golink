import { cn } from '@/lib/utils'

interface KbdProps {
  children: React.ReactNode
  className?: string
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        'pointer-events-none inline-flex h-5 items-center gap-1 rounded-md border border-border-subtle bg-bg-subtle px-1.5 text-[10px] font-medium text-content-subtle select-none',
        className
      )}
    >
      {children}
    </kbd>
  )
}
