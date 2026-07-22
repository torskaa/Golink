import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DubPartner SEA - Modern Affiliate Marketing Platform',
  description: 'Build and manage your affiliate program with DubPartner SEA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-bg-default text-content-emphasis antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
