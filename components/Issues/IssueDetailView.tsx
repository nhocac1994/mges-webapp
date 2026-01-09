'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import CompleteIssueModal from './CompleteIssueModal'

interface IssueDetailViewProps {
  issue: any
  onBack: () => void
  onUpdate?: () => void // Callback để refresh data sau khi update
}

export default function IssueDetailView({ issue, onBack, onUpdate }: IssueDetailViewProps) {
  const { user } = useAuth()
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentIssue, setCurrentIssue] = useState(issue)

  // Sync với issue prop khi nó thay đổi
  useEffect(() => {
    if (issue) {
      setCurrentIssue(issue)
    }
  }, [issue])

  if (!currentIssue) return null

  // Nhận việc - chuyển từ Pending → In Progress
  const handleAccept = async () => {
    if (!confirm('Are you sure you want to accept this task?')) {
      return
    }

    try {
      setLoading(true)
      
      // Update status thành In Progress và set AssignTo
      const updateData = {
        status: 'In Progress',
        assignTo: user?.fullName || user?.username || '',
      }

      // Gọi API update
      const response: any = await api.patch(`/issues/${currentIssue.Id}/status`, updateData)
      
      if (response.success) {
        // Cập nhật lại issue với data mới
        const updatedIssue = response.data || response
        setCurrentIssue(updatedIssue)
        
        // Gọi callback để refresh danh sách
        if (onUpdate) {
          onUpdate()
        }
        
        alert('Task accepted successfully! Status changed to "In Progress"')
      }
    } catch (error: any) {
      console.error('Error accepting issue:', error)
      alert(error.message || 'An error occurred while accepting the task')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (data: { materialsUsed?: string; resultsComments?: string }) => {
    try {
      setLoading(true)
      
      // Update status thành Completed và thêm DoneOn, MaterialsUsed, ResultsComments
      const updateData = {
        status: 'Completed',
        doneOn: new Date().toISOString(),
        materialsUsed: data.materialsUsed || currentIssue.MaterialsUsed || null,
        resultsComments: data.resultsComments || null,
      }

      // Gọi API update
      const response: any = await api.patch(`/issues/${currentIssue.Id}/status`, updateData)
      
      if (response.success) {
        // Cập nhật lại issue với data mới
        const updatedIssue = response.data || response
        setCurrentIssue(updatedIssue)
        setShowCompleteModal(false)
        
        // Gọi callback để refresh danh sách
        if (onUpdate) {
          onUpdate()
        }
        
        alert('Marked as completed!')
      }
    } catch (error: any) {
      console.error('Error completing issue:', error)
      alert(error.message || 'An error occurred while marking as completed')
    } finally {
      setLoading(false)
    }
  }

  // Kiểm tra xem user có quyền nhận việc không
  // Chỉ cho phép nếu status là Pending và user thuộc department của issue hoặc Admin
  const canAccept = 
    currentIssue.Status === 'Pending' && 
    (user?.role === 'Admin' || user?.department === currentIssue.Department)

  // Kiểm tra xem user có quyền hoàn thành issue không
  // Chỉ cho phép nếu status là In Progress và user thuộc department của issue hoặc Admin
  const canComplete = 
    currentIssue.Status === 'In Progress' && 
    (user?.role === 'Admin' || user?.department === currentIssue.Department)

  // Helper function để tạo image URL đúng
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return ''
    if (imageUrl.startsWith('/uploads/')) {
      const fileName = imageUrl.replace('/uploads/', '')
      return `/api/uploads/${fileName}`
    }
    return `/api/uploads${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-4">
        {/* Header với nút quay lại và hoàn thành */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Issue Details</h1>
            <p className="text-sm text-gray-600">ID: {currentIssue.Id}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Workflow Status Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${currentIssue.Status === 'Pending' ? 'bg-yellow-500 animate-pulse' : currentIssue.Status === 'In Progress' || currentIssue.Status === 'Completed' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                <span className={`text-xs ${currentIssue.Status === 'Pending' ? 'font-semibold text-yellow-700' : 'text-gray-600'}`}>Pending</span>
              </div>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${currentIssue.Status === 'In Progress' ? 'bg-blue-500 animate-pulse' : currentIssue.Status === 'Completed' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                <span className={`text-xs ${currentIssue.Status === 'In Progress' ? 'font-semibold text-blue-700' : 'text-gray-600'}`}>In Progress</span>
              </div>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${currentIssue.Status === 'Completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-xs ${currentIssue.Status === 'Completed' ? 'font-semibold text-green-700' : 'text-gray-600'}`}>Completed</span>
              </div>
            </div>

            {/* Action Buttons */}
            {canAccept && (
              <button
                onClick={handleAccept}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 shadow-sm text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {loading ? 'Processing...' : 'Accept Task'}
              </button>
            )}
            {canComplete && (
              <button
                onClick={() => setShowCompleteModal(true)}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5 shadow-sm text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Complete
              </button>
            )}
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition flex items-center gap-1.5 shadow-sm text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Issue Day</label>
              <p className="text-sm text-gray-900">
                {new Date(issue.IssueDay).toLocaleString('vi-VN')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Status</label>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentIssue.Status)}`}>
                {currentIssue.Status}
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Issue</label>
              <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-2 rounded">{currentIssue.Issue}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Area</label>
              <p className="text-sm text-gray-900">{currentIssue.Area}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Requested by</label>
              <p className="text-sm text-gray-900">{currentIssue.RequestedBy}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Department</label>
              <p className="text-sm text-gray-900">{currentIssue.Department}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Priority</label>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(currentIssue.Priority)}`}>
                {currentIssue.Priority}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Requested Deadline</label>
              <p className="text-sm text-gray-900">
                {currentIssue.RequestedDeadline ? new Date(currentIssue.RequestedDeadline).toLocaleDateString('vi-VN') : '-'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-0.5">Estimated Completion Time</label>
              <p className="text-sm text-gray-900">
                {currentIssue.EstimatedCompletionTime ? new Date(currentIssue.EstimatedCompletionTime).toLocaleDateString('vi-VN') : '-'}
              </p>
            </div>

            {currentIssue.AssignTo && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Assign to</label>
                <p className="text-sm text-gray-900">{currentIssue.AssignTo}</p>
              </div>
            )}

            {currentIssue.FollowedBy && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Followed by</label>
                <p className="text-sm text-gray-900">{currentIssue.FollowedBy}</p>
              </div>
            )}

            {currentIssue.DoneOn && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Done on</label>
                <p className="text-sm text-gray-900">
                  {new Date(currentIssue.DoneOn).toLocaleString('vi-VN')}
                </p>
              </div>
            )}

            {currentIssue.MaterialsUsed && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Materials Used</label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-2 rounded">{currentIssue.MaterialsUsed}</p>
              </div>
            )}

            {currentIssue.ResultsComments && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Results & Comments</label>
                <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-2 rounded">{currentIssue.ResultsComments}</p>
              </div>
            )}

            {currentIssue.ImageUrl && (
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Photo</label>
                <div className="mt-1 relative inline-block">
                  <img
                    src={getImageUrl(currentIssue.ImageUrl)}
                    alt="Issue photo"
                    className="max-w-xs h-auto rounded border cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ maxHeight: '150px', objectFit: 'contain' }}
                    onClick={() => setImageModalOpen(true)}
                    onError={(e) => {
                      console.warn('Image load failed')
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <p className="text-xs text-gray-400 mt-0.5">Click để xem ảnh lớn</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Issue Modal */}
      <CompleteIssueModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onComplete={handleComplete}
        loading={loading}
      />

      {/* Full Image Modal */}
      {imageModalOpen && currentIssue.ImageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={getImageUrl(currentIssue.ImageUrl)}
              alt="Issue photo full size"
              className="max-w-full max-h-[90vh] w-auto h-auto rounded-lg mx-auto"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                console.warn('Full size image load failed')
                e.currentTarget.style.display = 'none'
                setImageModalOpen(false)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

