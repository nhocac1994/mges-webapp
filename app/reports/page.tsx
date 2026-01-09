'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { api } from '@/lib/api'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { useSocket } from '@/contexts/SocketContext'

interface Issue {
  Id: number
  IssueDay: string
  Issue: string
  Area: string
  RequestedBy: string
  Department: string
  Priority: string
  RequestedDeadline: string | null
  EstimatedCompletionTime: string | null
  AssignTo: string | null
  FollowedBy: string | null
  Status: string
  DoneOn: string | null
  MaterialsUsed: string | null
  ResultsComments: string | null
}

function ReportsContent() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    priority: '',
    area: '',
    search: '',
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 50

  const toggleRow = (issueId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(issueId)) {
      newExpanded.delete(issueId)
    } else {
      newExpanded.add(issueId)
    }
    setExpandedRows(newExpanded)
  }

  useEffect(() => {
    fetchIssues()
  }, [page, filters])

  // Listen to socket events for real-time updates
  useEffect(() => {
    if (!socket) return

    const handleIssueCreated = () => {
      console.log('📢 Received issue:created event, refreshing reports...')
      fetchIssues()
    }

    const handleIssueUpdated = () => {
      console.log('📢 Received issue:updated event, refreshing reports...')
      fetchIssues()
    }

    const handleIssueStatusChanged = () => {
      console.log('📢 Received issue:status-changed event, refreshing reports...')
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
        pageSize: pageSize.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        ),
      })

      const response: any = await api.get(`/issues?${params}`)
      
      let issuesData: Issue[] = []
      let totalPagesData = 0
      
      if (Array.isArray(response)) {
        issuesData = response
        totalPagesData = 1
      } else if (response && response.data) {
        issuesData = Array.isArray(response.data) ? response.data : []
        totalPagesData = response.totalPages || 0
      }
      
      setIssues(issuesData)
      setTotalPages(totalPagesData || 0)
    } catch (error) {
      console.error('Error fetching issues:', error)
      setIssues([])
      setTotalPages(0)
    } finally {
      setLoading(false)
    }
  }

  // Filter data
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        return (
          issue.Issue?.toLowerCase().includes(searchLower) ||
          issue.RequestedBy?.toLowerCase().includes(searchLower) ||
          issue.Area?.toLowerCase().includes(searchLower) ||
          issue.Department?.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
  }, [issues, filters.search])

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Issue Day',
      'Issue (Sự cố)',
      'Area (Khu vực)',
      'Requested by (Yêu cầu bởi)',
      'Department (Bộ Phận)',
      'Priority (Ưu tiên)',
      'Requested Deadline',
      'Estimated Completion Time (Thời gian dự kiến hoàn thành)',
      'Assign to (Phân bổ cho)',
      'Followed by (Người giám sát)',
      'Status (Trạng thái)',
      'Done on (Thời gian hoàn thành)',
      'Materials Used (Vật tư sử dụng nếu có)',
      'Results & Comments (Lưu Ý)'
    ]

    const rows = filteredIssues.map(issue => [
      issue.IssueDay ? new Date(issue.IssueDay).toLocaleDateString('vi-VN') : '',
      issue.Issue || '',
      issue.Area || '',
      issue.RequestedBy || '',
      issue.Department || '',
      issue.Priority || '',
      issue.RequestedDeadline ? new Date(issue.RequestedDeadline).toLocaleDateString('vi-VN') : '',
      issue.EstimatedCompletionTime ? new Date(issue.EstimatedCompletionTime).toLocaleDateString('vi-VN') : '',
      issue.AssignTo || '',
      issue.FollowedBy || '',
      issue.Status || '',
      issue.DoneOn ? new Date(issue.DoneOn).toLocaleDateString('vi-VN') : '',
      issue.MaterialsUsed || '',
      issue.ResultsComments || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `issues-report-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export to PDF
  const exportToPDF = async () => {
    try {
      const jsPDF = (await import('jspdf')).default
      const autoTable = (await import('jspdf-autotable')).default

      const doc = new jsPDF('landscape')
      
      // Title
      doc.setFontSize(16)
      doc.text('Detailed Issues Report', 14, 15)
      
      // Date
      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleString('vi-VN')}`, 14, 22)

      // Table data
      const tableData = filteredIssues.map(issue => [
        issue.IssueDay ? new Date(issue.IssueDay).toLocaleDateString('vi-VN') : '',
        (issue.Issue || '').substring(0, 30) + (issue.Issue?.length > 30 ? '...' : ''),
        issue.Area || '',
        issue.RequestedBy || '',
        issue.Department || '',
        issue.Priority || '',
        issue.RequestedDeadline ? new Date(issue.RequestedDeadline).toLocaleDateString('vi-VN') : '',
        issue.EstimatedCompletionTime ? new Date(issue.EstimatedCompletionTime).toLocaleDateString('vi-VN') : '',
        issue.AssignTo || '',
        issue.FollowedBy || '',
        issue.Status || '',
        issue.DoneOn ? new Date(issue.DoneOn).toLocaleDateString('vi-VN') : '',
        (() => {
          const materialsUsed = issue.MaterialsUsed || '';
          return materialsUsed.substring(0, 20) + (materialsUsed.length > 20 ? '...' : '');
        })(),
        (() => {
          const resultsComments = issue.ResultsComments || '';
          return resultsComments.substring(0, 30) + (resultsComments.length > 30 ? '...' : '');
        })(),
      ])

      autoTable(doc, {
        head: [[
          'Issue Day',
          'Issue',
          'Area',
          'Requested by',
          'Department',
          'Priority',
          'Deadline',
          'Est. Completion',
          'Assign to',
          'Followed by',
          'Status',
          'Done on',
          'Materials',
          'Results'
        ]],
        body: tableData,
        startY: 28,
        styles: { fontSize: 7 },
        headStyles: { fillColor: [59, 130, 246], fontSize: 8 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 10, right: 10 },
      })

      doc.save(`issues-report-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Lỗi khi xuất PDF. Vui lòng thử lại.')
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

  if (loading && issues.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📋 Detailed Issues Report</h1>
          <p className="text-gray-600">View and export complete report of all issues</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Priority</option>
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
              <option value="Highest">Highest</option>
            </select>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Department</option>
              <option value="IT">IT</option>
              <option value="Front Office">Front Office</option>
              <option value="MOD">MOD</option>
              <option value="Engineering">Engineering</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                📄 CSV
              </button>
              <button
                onClick={exportToPDF}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                📑 PDF
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12"></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Day</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue (Sự cố)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area (Khu vực)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested by</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested Deadline</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Completion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredIssues.length > 0 ? (
                  filteredIssues.map((issue) => {
                    const isExpanded = expandedRows.has(issue.Id)
                    return (
                      <React.Fragment key={issue.Id}>
                        <tr 
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => toggleRow(issue.Id)}
                        >
                          <td className="px-4 py-3">
                            <svg 
                              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                            {issue.IssueDay ? new Date(issue.IssueDay).toLocaleDateString('vi-VN') : '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-900 max-w-xs">
                            <div className="truncate" title={issue.Issue}>
                              {issue.Issue || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">{issue.Area || '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">{issue.RequestedBy || '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">{issue.Department || '-'}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {issue.Priority ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.Priority)}`}>
                                {issue.Priority}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                            {issue.RequestedDeadline ? new Date(issue.RequestedDeadline).toLocaleDateString('vi-VN') : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                            {issue.EstimatedCompletionTime ? new Date(issue.EstimatedCompletionTime).toLocaleDateString('vi-VN') : '-'}
                          </td>
                        </tr>
                        {/* Expanded Row */}
                        {isExpanded && (
                          <tr className="bg-gray-50">
                            <td colSpan={9} className="px-4 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Assign to</label>
                                  <p className="text-sm text-gray-900">{issue.AssignTo || '-'}</p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Followed by</label>
                                  <p className="text-sm text-gray-900">{issue.FollowedBy || '-'}</p>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                                  {issue.Status ? (
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.Status)}`}>
                                      {issue.Status}
                                    </span>
                                  ) : '-'}
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Done on</label>
                                  <p className="text-sm text-gray-900">
                                    {issue.DoneOn ? new Date(issue.DoneOn).toLocaleDateString('vi-VN') : '-'}
                                  </p>
                                </div>
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Materials Used</label>
                                  <p className="text-sm text-gray-900 whitespace-pre-wrap bg-white p-2 rounded border">
                                    {issue.MaterialsUsed || '-'}
                                  </p>
                                </div>
                                <div className="md:col-span-3">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Results & Comments</label>
                                  <p className="text-sm text-gray-900 whitespace-pre-wrap bg-white p-2 rounded border">
                                    {issue.ResultsComments || '-'}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  )
}

