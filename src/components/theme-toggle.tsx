'use client'

import { useTheme } from '@/components/theme-provider'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-content-subtle hover:bg-bg-subtle hover:text-content-emphasis transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
