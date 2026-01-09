'use client'

import { useState, useEffect } from 'react'

interface IssueDetailModalProps {
  issue: any
  isOpen: boolean
  onClose: () => void
}

export default function IssueDetailModal({ issue, isOpen, onClose }: IssueDetailModalProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Reset image error when modal opens or issue changes
  useEffect(() => {
    if (isOpen && issue) {
      setImageError(false)
    }
  }, [isOpen, issue?.Id])

  if (!isOpen || !issue) return null

  // Helper function để tạo image URL đúng
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return ''
    if (imageUrl.startsWith('/uploads/')) {
      const fileName = imageUrl.replace('/uploads/', '')
      return `/api/uploads/${fileName}`
    }
    return `/api/uploads${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.warn('Image load failed, hiding image')
    setImageError(true)
    e.currentTarget.style.display = 'none'
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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Chi tiết Issue</h2>
              <p className="text-sm text-gray-500 mt-1">ID: {issue.Id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Close"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Day</label>
                <p className="text-gray-900">
                  {new Date(issue.IssueDay).toLocaleString('vi-VN')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(issue.Status)}`}>
                  {issue.Status}
                </span>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue</label>
                <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{issue.Issue}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <p className="text-gray-900">{issue.Area}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requested by</label>
                <p className="text-gray-900">{issue.RequestedBy}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <p className="text-gray-900">{issue.Department}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(issue.Priority)}`}>
                  {issue.Priority}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requested Deadline</label>
                <p className="text-gray-900">
                  {issue.RequestedDeadline ? new Date(issue.RequestedDeadline).toLocaleDateString('vi-VN') : '-'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Completion Time</label>
                <p className="text-gray-900">
                  {issue.EstimatedCompletionTime ? new Date(issue.EstimatedCompletionTime).toLocaleDateString('vi-VN') : '-'}
                </p>
              </div>

              {issue.AssignTo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign to</label>
                  <p className="text-gray-900">{issue.AssignTo}</p>
                </div>
              )}

              {issue.FollowedBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Followed by</label>
                  <p className="text-gray-900">{issue.FollowedBy}</p>
                </div>
              )}

              {issue.DoneOn && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Done on</label>
                  <p className="text-gray-900">
                    {new Date(issue.DoneOn).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}

              {issue.MaterialsUsed && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Materials Used</label>
                  <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{issue.MaterialsUsed}</p>
                </div>
              )}

              {issue.ResultsComments && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Results & Comments</label>
                  <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{issue.ResultsComments}</p>
                </div>
              )}

              {issue.ImageUrl && !imageError && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                  <div className="mt-2 relative">
                    <img
                      src={getImageUrl(issue.ImageUrl)}
                      alt="Issue photo"
                      className="max-w-full h-auto rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ maxHeight: '400px', objectFit: 'contain' }}
                      onClick={() => setImageModalOpen(true)}
                      onError={handleImageError}
                    />
                    <p className="text-xs text-gray-500 mt-1">Click để xem ảnh lớn</p>
                  </div>
                </div>
              )}
              {issue.ImageUrl && imageError && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                  <div className="mt-2 p-4 bg-gray-100 rounded-lg border border-gray-300 text-center">
                    <p className="text-sm text-gray-500">Không thể tải ảnh</p>
                    <p className="text-xs text-gray-400 mt-1">URL: {issue.ImageUrl}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {imageModalOpen && issue.ImageUrl && !imageError && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4"
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
              src={getImageUrl(issue.ImageUrl)}
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
    </>
  )
}

