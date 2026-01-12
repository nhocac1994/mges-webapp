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

    // Lấy API URL từ environment variable
    const API_URL = process.env.NEXT_PUBLIC_API_URL
    
    // Kiểm tra nếu đang chạy trên HTTPS (Vercel production)
    const isHTTPS = typeof window !== 'undefined' && window.location.protocol === 'https:'
    
    // Chỉ kết nối socket nếu có API_URL và không phải localhost
    if (!API_URL || API_URL.includes('localhost')) {
      console.log('⚠️ Socket.IO: API_URL not configured or is localhost, skipping socket connection')
      return
    }
    
    // Nếu đang trên HTTPS nhưng API_URL là HTTP, chỉ dùng polling (tránh Mixed Content)
    const transports = isHTTPS && API_URL.startsWith('http://') 
      ? ['polling'] // Chỉ dùng polling trên HTTPS với HTTP backend
      : ['websocket', 'polling'] // Dùng cả websocket và polling cho HTTP hoặc HTTPS với HTTPS backend
    
    console.log(`🔌 Socket.IO: Connecting to ${API_URL} with transports: ${transports.join(', ')}`)
    
    // Tạo socket connection
    const newSocket = io(API_URL, {
      transports: transports,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      upgrade: !isHTTPS || !API_URL.startsWith('http://'), // Không upgrade nếu HTTPS với HTTP backend
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

