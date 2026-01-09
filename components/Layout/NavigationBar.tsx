'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function NavigationBar() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/')
  }

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/issues', label: 'Issues List', icon: '📋' },
    { href: '/reports', label: 'Reports', icon: '📄' },
  ]

  if (!isAuthenticated) return null

  return (
    <nav className="hidden md:block bg-gray-50 border-b border-gray-300 shadow-sm sticky top-16 z-30">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-1 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(item.href)
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

