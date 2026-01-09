'use client'

import IssueForm from '@/components/Form/IssueForm'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'

function NewIssueContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">➕ Tạo yêu cầu mới</h1>
          <p className="text-gray-600">Thêm yêu cầu bảo trì mới</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <IssueForm />
        </div>
      </div>
    </div>
  )
}

export default function NewIssuePage() {
  return (
    <ProtectedRoute>
      <NewIssueContent />
    </ProtectedRoute>
  )
}

