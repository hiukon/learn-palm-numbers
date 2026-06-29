import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tử vi số học',
  description: 'Xem lịch âm hôm nay và khám phá chỉ tay số học trong cùng một ứng dụng',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FALM',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#6cad39',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
