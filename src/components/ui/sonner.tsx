'use client'

import { Toaster as SonnerToaster } from 'sonner'

type ToasterProps = React.ComponentProps<typeof SonnerToaster>

export function Toaster({ ...props }: ToasterProps) {
  return (
    <SonnerToaster
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
        toast:
             'group toast group-[.toaster]:bg-bg-default group-[.toaster]:text-content-emphasis group-[.toaster]:border-border-default group-[.toaster]:shadow-lg',
           description: 'group-[.toast]:text-content-subtle',
           actionButton:
             'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
           cancelButton:
             'group-[.toast]:bg-bg-subtle group-[.toast]:text-content-subtle',
        },
      }}
      {...props}
    />
  )
}
