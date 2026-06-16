import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TwinOS | AI-Powered Digital Twin Platform',
  description: 'Stop guessing. Simulate business decisions before they cost money. TwinOS uses AI to create digital twins for your business.',
  openGraph: {
    title: 'TwinOS | AI-Powered Digital Twin Platform',
    description: 'Stop guessing. Simulate business decisions before they cost money.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F5F5F5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#F5F5F5] text-black">
        {children}
      </body>
    </html>
  );
}
