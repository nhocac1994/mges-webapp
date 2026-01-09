'use client'

import { useState } from 'react'

interface CompleteIssueModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: { materialsUsed?: string; resultsComments?: string }) => Promise<void>
  loading?: boolean
}

export default function CompleteIssueModal({ isOpen, onClose, onComplete, loading = false }: CompleteIssueModalProps) {
  const [formData, setFormData] = useState({
    materialsUsed: '',
    resultsComments: '',
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onComplete(formData)
    // Reset form sau khi complete
    setFormData({ materialsUsed: '', resultsComments: '' })
  }

  const handleCancel = () => {
    setFormData({ materialsUsed: '', resultsComments: '' })
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">✅ Hoàn thành Issue</h2>
            <p className="text-sm text-gray-500 mt-1">Vui lòng điền thông tin hoàn thành (tùy chọn)</p>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materials Used
              </label>
              <textarea
                value={formData.materialsUsed}
                onChange={(e) => setFormData({ ...formData, materialsUsed: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter materials used (if any)..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Results & Comments <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.resultsComments}
                onChange={(e) => setFormData({ ...formData, resultsComments: e.target.value })}
                rows={4}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter results and comments about the completed work..."
              />
            </div>

            {/* Footer */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                {loading ? 'Processing...' : '✅ Confirm Completion'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

