'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/contexts/SocketContext'
import Link from 'next/link'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'
import IssueCard from '@/components/Issues/IssueCard'
import SlideInModal from '@/components/Modal/SlideInModal'
import IssueForm from '@/components/Form/IssueForm'
import IssueDetailView from '@/components/Issues/IssueDetailView'

function IssuesContent() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFormModal, setShowFormModal] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<any>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchIssues()
  }, [page, filters])

  // Listen to socket events for real-time updates
  useEffect(() => {
    if (!socket) return

    const handleIssueCreated = () => {
      console.log('📢 Received issue:created event, refreshing issues...')
      fetchIssues()
    }

    const handleIssueUpdated = () => {
      console.log('📢 Received issue:updated event, refreshing issues...')
      fetchIssues()
    }

    const handleIssueStatusChanged = () => {
      console.log('📢 Received issue:status-changed event, refreshing issues...')
      fetchIssues()
    }

    socket.on('issue:created', handleIssueCreated)
    socket.on('issue:updated', handleIssueUpdated)
    socket.on('issue:status-changed', handleIssueStatusChanged)

    return () => {
      socket.off('issue:created', handleIssueCreated)
      socket.off('issue:updated', handleIssueUpdated)
      socket.off('issue:status-changed', handleIssueStatusChanged)
    }
  }, [socket, page, filters])

  const fetchIssues = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      })

      const response: any = await api.get(`/issues?${params}`)
      // API route trả về { data: [...], totalPages: ... }
      // api interceptor đã extract response.data, nên response là { data: [...], totalPages: ... }
      console.log('Response from API:', response)
      
      // Xử lý response - có thể là { data: [...], totalPages: ... } hoặc trực tiếp là array
      let issuesData: any[] = []
      let totalPagesData = 0
      
      if (Array.isArray(response)) {
        // Nếu response là array trực tiếp
        issuesData = response
        totalPagesData = 1
      } else if (response && response.data) {
        // Nếu response có data property
        issuesData = Array.isArray(response.data) ? response.data : []
        totalPagesData = response.totalPages || 0
      } else if (response && Array.isArray(response)) {
        // Fallback
        issuesData = response
        totalPagesData = 0
      }
      
      // Đảm bảo issues luôn là array
      setIssues(Array.isArray(issuesData) ? issuesData : [])
      setTotalPages(totalPagesData || 0)
    } catch (error) {
      console.error('Error fetching issues:', error)
      // Set fallback để tránh undefined
      setIssues([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
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
    // Refresh data khi quay lại từ detail view
    fetchIssues()
  }

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
      <>
        <IssueDetailView 
          issue={selectedIssue} 
          onBack={handleBackToList}
          onUpdate={() => {
            // Refresh lại danh sách và reload issue detail
            fetchIssues()
            if (selectedIssue) {
              handleRowClick(selectedIssue.Id)
            }
          }}
        />
        {/* Form Modal vẫn có thể mở từ detail view */}
        <SlideInModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          title="Create New Maintenance Request"
          size="lg"
        >
          <IssueForm 
            onSuccess={() => {
              setShowFormModal(false)
              fetchIssues()
            }}
            onCancel={() => setShowFormModal(false)}
          />
        </SlideInModal>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Filters - Tối ưu cho mobile */}
        <div className="bg-white rounded-lg shadow-md p-3 md:p-4 mb-4 md:mb-6">
          {/* Mobile: Layout dọc, Desktop: Layout ngang */}
          <div className="flex flex-col md:flex-row gap-2 md:gap-3">
            {/* Search Bar - Full width trên mobile */}
            <div className="flex-1 w-full">
              <div className="relative">
                <svg className="absolute left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Row 2 trên mobile: Filter và Buttons */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Status Filter - Compact trên mobile */}
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="flex-1 md:flex-none px-3 md:px-4 py-2 md:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              >
                <option value="">All</option>
                <option value="Pending">⏳ Pending</option>
                <option value="In Progress">🔄 In Progress</option>
                <option value="Completed">✅ Completed</option>
                <option value="Cancelled">❌ Cancelled</option>
              </select>

              {/* Nút Tạo mới - Icon only trên mobile */}
              <button
                onClick={() => setShowFormModal(true)}
                className="px-3 md:px-4 py-2 md:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm hover:shadow-md flex items-center justify-center min-w-[44px]"
                title="Create new issue"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="ml-2 hidden md:inline">Create New</span>
              </button>

              {/* Clear Filters Button - Chỉ hiện khi có filter */}
              {(filters.search || filters.status) && (
                <button
                  onClick={() => setFilters({ status: '', search: '' })}
                  className="px-2 md:px-4 py-2 md:py-2.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  title="Clear filters"
                >
                  <svg className="w-4 h-4 md:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="hidden md:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Info về filter tự động - Ẩn trên mobile */}
          {user && user.role !== 'Admin' && (
            <div className="hidden md:block mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💡 Showing issues from your department: <strong>{user.department}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Desktop Table View - Hidden on mobile */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {/* Desktop: Table View */}
            <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Day</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {issues && Array.isArray(issues) && issues.length > 0 ? (
                      issues.map((issue) => (
                        <tr
                          key={issue.Id}
                          onClick={() => handleRowClick(issue.Id)}
                          className="hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(issue.IssueDay).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {issue.Issue}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {issue.Area}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {issue.Department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.Priority)}`}>
                              {issue.Priority}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.Status)}`}>
                              {issue.Status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile: Card View */}
            <div className="md:hidden space-y-4">
              {issues && Array.isArray(issues) && issues.length > 0 ? (
                issues.map((issue) => (
                  <div
                    key={issue.Id}
                    onClick={() => handleRowClick(issue.Id)}
                    className="cursor-pointer"
                  >
                    <IssueCard
                      issue={issue}
                      getStatusColor={getStatusColor}
                      getPriorityColor={getPriorityColor}
                    />
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-md px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {page} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Form Modal */}
        <SlideInModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          title="Create New Maintenance Request"
          size="lg"
        >
          <IssueForm 
            onSuccess={() => {
              setShowFormModal(false)
              fetchIssues()
            }}
            onCancel={() => setShowFormModal(false)}
          />
        </SlideInModal>
      </div>
    </div>
  )
}

export default function IssuesPage() {
  return (
    <ProtectedRoute>
      <IssuesContent />
    </ProtectedRoute>
  )
}

