'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Get current page title
  const getPageTitle = () => {
    if (pathname === '/') return 'Maintenance System'
    if (pathname === '/dashboard') return 'Dashboard'
    if (pathname === '/issues') return 'Issues List'
    if (pathname?.startsWith('/issues/')) return 'Issue Details'
    if (pathname === '/issues/new') return 'Create New Issue'
    if (pathname === '/reports') return 'Reports'
    if (pathname === '/profile') return 'Profile'
    if (pathname === '/admin') return 'User Management'
    if (pathname === '/login') return 'Login'
    
    return 'Maintenance System'
  }

  const pageTitle = getPageTitle()

  const isHomePage = pathname === '/'

  return (
    <header className="bg-gray-50 shadow-md sticky top-0 z-40 border-b border-gray-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo hoặc Tiêu đề trang - Bên trái */}
          {isHomePage ? (
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="text-2xl">🛠️</div>
              <div>
                <div className="font-bold text-lg text-gray-900">Maintenance System</div>
                <div className="text-xs text-gray-500">Engineering</div>
              </div>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🛠️</div>
              <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
            </div>
          )}

          {/* User Menu & Mobile Button */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user && (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">{user.fullName}</div>
                    <div className="text-xs text-gray-600">{user.department}</div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                      <div className="text-xs text-gray-500">{user.department}</div>
                      <div className="text-xs text-gray-400 mt-1">Role: {user.role}</div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      👤 Profile
                    </Link>
                    {user.role === 'Admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        👥 User Management
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout()
                        setUserMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {!isAuthenticated && (
              <Link
                href="/login"
                className="hidden md:block px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t mt-2 pt-4">
            <div className="flex flex-col space-y-2">
              {isAuthenticated && (
                <>
                  <Link
                    href="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">🏠</span>
                    Trang chủ
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/dashboard'
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">📊</span>
                    Dashboard
                  </Link>
                  <Link
                    href="/issues"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/issues' || pathname?.startsWith('/issues/')
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">📋</span>
                    Danh sách Issues
                  </Link>
                </>
              )}
              
              {isAuthenticated && user && (
                <div className="px-4 py-3 border-t border-gray-200 mt-2 pt-3 space-y-2">
                  <div className="text-sm font-medium text-gray-900 mb-1">{user.fullName}</div>
                  <div className="text-xs text-gray-500 mb-3">{user.department} • {user.role}</div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-center"
                  >
                    👤 Profile
                  </Link>
                  {user.role === 'Admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-center"
                    >
                      👥 User Management
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
              
              {!isAuthenticated && (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-center"
                >
                  Login
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

