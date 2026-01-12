'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => useContext(SocketContext)

interface SocketProviderProps {
  children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { user, isAuthenticated } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect nếu chưa đăng nhập
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Kiểm tra nếu đang chạy trên HTTPS (Vercel production)
    const isHTTPS = typeof window !== 'undefined' && window.location.protocol === 'https:'
    const API_URL = process.env.NEXT_PUBLIC_API_URL
    
    // Chỉ kết nối socket nếu có API_URL và không phải localhost
    if (!API_URL || API_URL.includes('localhost')) {
      console.log('⚠️ Socket.IO: API_URL not configured or is localhost, skipping socket connection')
      return
    }
    
    // Nếu đang trên HTTPS và backend là HTTP, dùng Next.js API proxy để tránh Mixed Content
    let socketURL: string
    let socketPath: string = '/socket.io/'
    
    if (isHTTPS && API_URL.startsWith('http://')) {
      // Dùng Next.js API route để proxy socket requests
      socketURL = window.location.origin // Dùng cùng origin (Vercel HTTPS)
      socketPath = '/api/socket'
      console.log('🔌 Socket.IO: Using Next.js API proxy to avoid Mixed Content (HTTPS -> HTTP)')
    } else {
      socketURL = API_URL
      console.log(`🔌 Socket.IO: Connecting directly to ${socketURL}`)
    }
    
    // Tạo socket connection
    // Trên HTTPS với HTTP backend, chỉ dùng polling qua proxy
    const transports = isHTTPS && API_URL && API_URL.startsWith('http://')
      ? ['polling'] // Chỉ polling qua Next.js proxy
      : ['websocket', 'polling'] // Normal connection
    
    const newSocket = io(socketURL, {
      transports: transports,
      path: socketPath,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      upgrade: !(isHTTPS && API_URL && API_URL.startsWith('http://')), // Không upgrade nếu dùng proxy
    })

    newSocket.on('connect', () => {
      console.log('🔌 Socket connected:', newSocket.id)
      setIsConnected(true)

      // Join department room nếu user có department
      if (user?.department) {
        newSocket.emit('join-department', user.department)
        console.log(`👤 Joined department room: ${user.department}`)
      }

      // Join admin room nếu user là Admin
      if (user?.role === 'Admin') {
        newSocket.emit('join-admin')
        console.log('👑 Joined admin room')
      }
    })

    newSocket.on('disconnect', () => {
      console.log('🔌 Socket disconnected')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error)
      setIsConnected(false)
    })

    setSocket(newSocket)

    // Cleanup khi component unmount hoặc user thay đổi
    return () => {
      newSocket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.department, user?.role])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

