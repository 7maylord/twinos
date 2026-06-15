import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | TwinOS',
  description: 'Analytics and insights dashboard for TwinOS digital twin platform',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
