'use client'

import { useEffect, useState, useMemo } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/contexts/SocketContext'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'
import IssueDetailView from '@/components/Issues/IssueDetailView'
import IssueCard from '@/components/Issues/IssueCard'

function HomeContent() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [stats, setStats] = useState<any>(null)
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'inprogress' | 'completed'>('pending')
  const [selectedIssue, setSelectedIssue] = useState<any>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  // Listen to socket events for real-time updates
  useEffect(() => {
    if (!socket) return

    const handleIssueCreated = () => {
      console.log('📢 Received issue:created event, refreshing data...')
      fetchData()
    }

    const handleIssueUpdated = () => {
      console.log('📢 Received issue:updated event, refreshing data...')
      fetchData()
    }

    const handleIssueStatusChanged = () => {
      console.log('📢 Received issue:status-changed event, refreshing data...')
      fetchData()
    }

    const handleDashboardUpdated = () => {
      console.log('📢 Received dashboard:updated event, refreshing data...')
      fetchData()
    }

    socket.on('issue:created', handleIssueCreated)
    socket.on('issue:updated', handleIssueUpdated)
    socket.on('issue:status-changed', handleIssueStatusChanged)
    socket.on('dashboard:updated', handleDashboardUpdated)

    return () => {
      socket.off('issue:created', handleIssueCreated)
      socket.off('issue:updated', handleIssueUpdated)
      socket.off('issue:status-changed', handleIssueStatusChanged)
      socket.off('dashboard:updated', handleDashboardUpdated)
    }
  }, [socket, activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [statsRes, issuesRes]: any[] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get(`/issues?pageSize=50&status=${activeTab === 'pending' ? 'Pending' : activeTab === 'inprogress' ? 'In Progress' : 'Completed'}`)
      ])

      // Stats
      if (statsRes && (statsRes.totalReceivedMonth !== undefined || (statsRes.data && statsRes.data.totalReceivedMonth !== undefined))) {
        setStats(statsRes.data || statsRes)
      } else {
        setStats({
          totalReceivedMonth: 0,
          totalPendingMonth: 0,
          totalPendingAll: 0,
          totalCompletedMonth: 0,
        })
      }

      // Issues
      let issuesData: any[] = []
      if (Array.isArray(issuesRes)) {
        issuesData = issuesRes
      } else if (issuesRes && issuesRes.data) {
        issuesData = Array.isArray(issuesRes.data) ? issuesRes.data : []
      }
      setIssues(issuesData)
    } catch (error) {
      console.error('Error fetching data:', error)
      setStats({
        totalReceivedMonth: 0,
        totalPendingMonth: 0,
        totalPendingAll: 0,
        totalCompletedMonth: 0,
      })
      setIssues([])
    } finally {
      setLoading(false)
    }
  }

  // Kiểm tra issues mới (tạo trong 24h qua)
  const isNewIssue = (issue: any) => {
    const issueDate = new Date(issue.IssueDay)
    const now = new Date()
    const diffHours = (now.getTime() - issueDate.getTime()) / (1000 * 60 * 60)
    return diffHours <= 24
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      Normal: 'bg-green-100 text-green-800',
      High: 'bg-yellow-100 text-yellow-800',
      Urgent: 'bg-orange-100 text-orange-800',
      Highest: 'bg-red-100 text-red-800',
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  const handleRowClick = async (issueId: number) => {
    try {
      setLoadingDetail(true)
      setShowDetail(true)
      const response: any = await api.get(`/issues/${issueId}`)
      const issueData = response?.data || response || null
      if (issueData) {
        setSelectedIssue(issueData)
      } else {
        alert('Issue not found')
        setShowDetail(false)
      }
    } catch (error) {
      console.error('Error fetching issue:', error)
      alert('Unable to load issue details')
      setShowDetail(false)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleBackToList = () => {
    setShowDetail(false)
    setSelectedIssue(null)
    fetchData() // Refresh data khi quay lại
  }

  // Phân loại issues
  const pendingIssues = useMemo(() => issues.filter(i => i.Status === 'Pending'), [issues])
  const inProgressIssues = useMemo(() => issues.filter(i => i.Status === 'In Progress'), [issues])
  const completedIssues = useMemo(() => issues.filter(i => i.Status === 'Completed'), [issues])

  const displayIssues = activeTab === 'pending' ? pendingIssues : activeTab === 'inprogress' ? inProgressIssues : completedIssues

  // Nếu đang hiển thị chi tiết, show detail view
  if (showDetail) {
    if (loadingDetail) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading details...</p>
          </div>
        </div>
      )
    }
    
    return (
      <IssueDetailView 
        issue={selectedIssue} 
        onBack={handleBackToList}
        onUpdate={() => {
          // Refresh lại danh sách và reload issue detail
          fetchData()
          if (selectedIssue) {
            handleRowClick(selectedIssue.Id)
          }
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Stats Cards - Ẩn card thứ 2 và 3 trên mobile */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="bg-white rounded-lg shadow-md p-3 md:p-4 text-center">
              <div className="text-xl md:text-2xl font-bold text-indigo-600">{stats.totalReceivedMonth}</div>
              <div className="text-xs text-gray-600 mt-1">Received (this month)</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 md:p-4 text-center hidden md:block">
              <div className="text-xl md:text-2xl font-bold text-yellow-600">{stats.totalPendingMonth}</div>
              <div className="text-xs text-gray-600 mt-1">Pending (this month)</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 md:p-4 text-center hidden md:block">
              <div className="text-xl md:text-2xl font-bold text-orange-600">{stats.totalPendingAll}</div>
              <div className="text-xs text-gray-600 mt-1">Pending (all time)</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-3 md:p-4 text-center">
              <div className="text-xl md:text-2xl font-bold text-green-600">{stats.totalCompletedMonth}</div>
              <div className="text-xs text-gray-600 mt-1">Completed (this month)</div>
            </div>
          </div>
        )}

        {/* Issues Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="hidden md:inline">⏳ </span>
                <span>Pending ({pendingIssues.length})</span>
                {pendingIssues.filter(i => isNewIssue(i)).length > 0 && (
                  <span className="ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {pendingIssues.filter(i => isNewIssue(i)).length} New
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('inprogress')}
                className={`flex-1 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors ${
                  activeTab === 'inprogress'
                    ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="hidden md:inline">🔄 </span>
                <span>In Progress ({inProgressIssues.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`flex-1 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium transition-colors ${
                  activeTab === 'completed'
                    ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="hidden md:inline">✅ </span>
                <span>Completed ({completedIssues.length})</span>
              </button>
            </div>
          </div>

          {/* Content: Cards on mobile, Table on desktop */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : displayIssues.length > 0 ? (
            <>
              {/* Mobile: Card View */}
              <div className="md:hidden p-4 space-y-3">
                {displayIssues.map((issue) => (
                  <div
                    key={issue.Id}
                    onClick={() => handleRowClick(issue.Id)}
                    className="cursor-pointer"
                  >
                    <IssueCard
                      issue={{
                        ...issue,
                        Issue: activeTab === 'pending' && isNewIssue(issue) 
                          ? `${issue.Issue} [New]` 
                          : issue.Issue
                      }}
                      getStatusColor={getStatusColor}
                      getPriorityColor={getPriorityColor}
                    />
                  </div>
                ))}
              </div>

              {/* Desktop: Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Day</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      {activeTab === 'inprogress' && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assign to</th>
                      )}
                      {activeTab === 'completed' && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Done on</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displayIssues.map((issue) => (
                      <tr
                        key={issue.Id}
                        onClick={() => handleRowClick(issue.Id)}
                        className="hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                          {new Date(issue.IssueDay).toLocaleDateString('en-US')}
                        </td>
                        <td className="px-4 py-3 text-gray-900 max-w-xs">
                          <div className="flex items-center gap-2">
                            <span className="truncate">{issue.Issue}</span>
                            {activeTab === 'pending' && isNewIssue(issue) && (
                              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full whitespace-nowrap">
                                New
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">{issue.Area}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">{issue.Department}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.Priority)}`}>
                            {issue.Priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.Status)}`}>
                            {issue.Status}
                          </span>
                        </td>
                        {activeTab === 'inprogress' && (
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">{issue.AssignTo || '-'}</td>
                        )}
                        {activeTab === 'completed' && (
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                            {issue.DoneOn ? new Date(issue.DoneOn).toLocaleDateString('en-US') : '-'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  )
}

