'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'

function IssueDetailContent() {
  const params = useParams()
  const router = useRouter()
  const [issue, setIssue] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [imageModalOpen, setImageModalOpen] = useState(false)

  // Helper function để tạo image URL đúng
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return ''
    // ImageUrl từ backend: /uploads/issue-xxx.webp
    // Route pattern: /api/uploads/[...path]
    // Cách 1: Tạo /api/uploads/uploads/issue-xxx.webp → route nhận ['uploads', 'issue-xxx.webp'] → normalize → /uploads/issue-xxx.webp ✅
    // Cách 2 (đơn giản hơn): Bỏ /uploads đầu, tạo /api/uploads/issue-xxx.webp → route nhận ['issue-xxx.webp'] → thêm /uploads → /uploads/issue-xxx.webp ✅
    if (imageUrl.startsWith('/uploads/')) {
      // Bỏ /uploads đầu, chỉ lấy phần sau
      const fileName = imageUrl.replace('/uploads/', '')
      return `/api/uploads/${fileName}`
    } else if (imageUrl.startsWith('/uploads')) {
      // Trường hợp /uploads (không có /)
      return `/api/uploads${imageUrl}`
    }
    // Nếu chưa có /uploads, thêm vào
    return `/api/uploads${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`
  }

  useEffect(() => {
    if (params.id) {
      fetchIssue()
    }
  }, [params.id])

  const fetchIssue = async () => {
    try {
      const response: any = await api.get(`/issues/${params.id}`)
      // API interceptor đã extract response.data, nên response đã là data rồi
      // API route trả về issue trực tiếp hoặc { data: issue }
      console.log('Issue response:', response)
      const issueData = response?.data || response || null
      setIssue(issueData)
      
      if (!issueData) {
        alert('Không tìm thấy issue')
        router.push('/issues')
      }
    } catch (error) {
      console.error('Error fetching issue:', error)
      alert('Không tìm thấy issue')
      router.push('/issues')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    )
  }

  if (!issue) {
    return null
  }

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="container mx-auto px-4 py-4 md:py-8">
            <div className="mb-4 md:mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Chi tiết Issue</h1>
                <p className="text-sm md:text-base text-gray-600">ID: {issue.Id}</p>
              </div>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại
              </button>
            </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Day</label>
              <p className="text-gray-900">
                {new Date(issue.IssueDay).toLocaleString('vi-VN')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                issue.Status === 'Completed' ? 'bg-green-100 text-green-800' :
                issue.Status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {issue.Status}
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue</label>
              <p className="text-gray-900 whitespace-pre-wrap">{issue.Issue}</p>
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
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                issue.Priority === 'Highest' || issue.Priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                issue.Priority === 'High' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
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
                <p className="text-gray-900 whitespace-pre-wrap">{issue.MaterialsUsed}</p>
              </div>
            )}

            {issue.ResultsComments && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Results & Comments</label>
                <p className="text-gray-900 whitespace-pre-wrap">{issue.ResultsComments}</p>
              </div>
            )}

            {issue.ImageUrl && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <div className="mt-2 relative">
                  <img
                    src={getImageUrl(issue.ImageUrl)}
                    alt="Issue photo"
                    className="max-w-full h-auto rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ maxHeight: '400px', objectFit: 'contain' }}
                    onClick={() => setImageModalOpen(true)}
                    onError={(e) => {
                      console.error('Image load error:', e)
                      console.error('Original ImageUrl:', issue.ImageUrl)
                      console.error('Generated URL:', getImageUrl(issue.ImageUrl))
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-1">Click để xem ảnh lớn</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageModalOpen && issue.ImageUrl && (
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
              src={getImageUrl(issue.ImageUrl)}
              alt="Issue photo full size"
              className="max-w-full max-h-[90vh] w-auto h-auto rounded-lg mx-auto"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                console.error('Image modal load error:', e)
                console.error('Original ImageUrl:', issue.ImageUrl)
                console.error('Generated URL:', getImageUrl(issue.ImageUrl))
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function IssueDetailPage() {
  return (
    <ProtectedRoute>
      <IssueDetailContent />
    </ProtectedRoute>
  )
}

