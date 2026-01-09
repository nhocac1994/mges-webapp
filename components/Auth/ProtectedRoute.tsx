'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    // Chờ AuthContext load xong
    if (!isLoading) {
      if (!isAuthenticated) {
        // Chỉ redirect nếu không phải đang ở trang login
        if (pathname !== '/login') {
          setShouldRedirect(true)
          router.push('/login')
        }
      } else {
        setShouldRedirect(false)
      }
    }
  }, [isAuthenticated, isLoading, router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || shouldRedirect) {
    return null
  }

  return <>{children}</>
}

