import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { SocketProvider } from '@/contexts/SocketContext'
import Header from '@/components/Layout/Header'
import NavigationBar from '@/components/Layout/NavigationBar'

export const metadata: Metadata = {
  title: 'Engineering Maintenance System',
  description: 'Hệ thống quản lý yêu cầu bảo trì',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <SocketProvider>
            <Header />
            <NavigationBar />
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

