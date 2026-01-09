'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/contexts/SocketContext'
import KPICards from '@/components/Dashboard/KPICards'
import AreaChart from '@/components/Dashboard/AreaChart'
import DepartmentChart from '@/components/Dashboard/DepartmentChart'
import DashboardTable from '@/components/Dashboard/DashboardTable'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'

function DashboardContent() {
  const { socket } = useSocket()
  const [stats, setStats] = useState<any>(null)
  const [areaData, setAreaData] = useState<any[]>([])
  const [departmentData, setDepartmentData] = useState<any[]>([])
  const [departmentDetails, setDepartmentDetails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Listen to socket events for real-time updates
  useEffect(() => {
    if (!socket) return

    const handleDashboardUpdated = () => {
      console.log('📢 Received dashboard:updated event, refreshing dashboard...')
      fetchDashboardData()
    }

    const handleIssueCreated = () => {
      console.log('📢 Received issue:created event, refreshing dashboard...')
      fetchDashboardData()
    }

    const handleIssueUpdated = () => {
      console.log('📢 Received issue:updated event, refreshing dashboard...')
      fetchDashboardData()
    }

    const handleIssueStatusChanged = () => {
      console.log('📢 Received issue:status-changed event, refreshing dashboard...')
      fetchDashboardData()
    }

    socket.on('dashboard:updated', handleDashboardUpdated)
    socket.on('issue:created', handleIssueCreated)
    socket.on('issue:updated', handleIssueUpdated)
    socket.on('issue:status-changed', handleIssueStatusChanged)

    return () => {
      socket.off('dashboard:updated', handleDashboardUpdated)
      socket.off('issue:created', handleIssueCreated)
      socket.off('issue:updated', handleIssueUpdated)
      socket.off('issue:status-changed', handleIssueStatusChanged)
    }
  }, [socket])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, areaRes, deptRes, deptDetailsRes]: any[] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/by-area'),
        api.get('/dashboard/by-department'),
        api.get('/dashboard/department-details'),
      ])

      // API interceptor đã extract response.data, nên statsRes, areaRes, deptRes đã là data rồi
      console.log('Dashboard response:', { statsRes, areaRes, deptRes, deptDetailsRes })
      
      // Xử lý stats
      const statsData = statsRes?.data || statsRes || null
      setStats(statsData)
      
      // Xử lý area data - đảm bảo là array
      const areaDataArray = Array.isArray(areaRes) ? areaRes : (Array.isArray(areaRes?.data) ? areaRes.data : [])
      setAreaData(areaDataArray)
      
      // Xử lý department data - đảm bảo là array
      const deptDataArray = Array.isArray(deptRes) ? deptRes : (Array.isArray(deptRes?.data) ? deptRes.data : [])
      setDepartmentData(deptDataArray)

      // Xử lý department details - đảm bảo là array
      const deptDetailsArray = Array.isArray(deptDetailsRes) ? deptDetailsRes : (Array.isArray(deptDetailsRes?.data) ? deptDetailsRes.data : [])
      setDepartmentDetails(deptDetailsArray)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set fallback để tránh undefined
      setStats(null)
      setAreaData([])
      setDepartmentData([])
      setDepartmentDetails([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">⏳</div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Ẩn title trên mobile, chỉ hiển thị trên desktop vì đã có trong header */}
        <div className="hidden md:block mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">📊 Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600">Engineering Maintenance Report</p>
        </div>

        {stats && <KPICards stats={stats} />}

        {/* Charts - Ẩn một chart trên mobile, chỉ hiển thị AreaChart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          {areaData.length > 0 && <AreaChart data={areaData} />}
          <div className="hidden lg:block">
            {departmentData.length > 0 && <DepartmentChart data={departmentData} />}
          </div>
        </div>

        {/* Dashboard Table với filter và export */}
        {departmentDetails.length > 0 && (
          <DashboardTable data={departmentDetails} loading={loading} />
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

