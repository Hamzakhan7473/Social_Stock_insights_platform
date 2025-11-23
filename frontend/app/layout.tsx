import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Social Stock Insights',
  description: 'Share stock analyses, trading ideas, and market insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

