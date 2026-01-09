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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:55777'
    
    // Tạo socket connection
    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
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

