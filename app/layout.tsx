import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TwinOS | AI-Powered Digital Twin Platform',
  description: 'Stop guessing. Simulate business decisions before they cost money. TwinOS uses AI to create digital twins for your business.',
  openGraph: {
    title: 'TwinOS | AI-Powered Digital Twin Platform',
    description: 'Stop guessing. Simulate business decisions before they cost money.',
    type: 'website',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-gradient-to-b from-background via-[#1a1f36] to-background text-foreground">
        {children}
      </body>
    </html>
  )
}
