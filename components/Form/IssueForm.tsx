'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { compressImage } from '@/lib/imageCompress'

interface IssueFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function IssueForm({ onSuccess, onCancel }: IssueFormProps = {}) {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [compressedFile, setCompressedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    issue: '',
    area: '',
    requestedBy: user?.fullName || '',
    department: user?.department || '',
    priority: 'Normal',
    requestedDeadline: '',
    estimatedCompletionTime: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // Compress image nếu cần
        const compressed = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.8,
          maxSizeMB: 2
        })
        
        setCompressedFile(compressed)
        
        // Hiển thị preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(compressed)
      } catch (error: any) {
        console.error('Error compressing image:', error)
        alert('Error processing image. Please try again.')
      }
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      try {
        // Compress image nếu cần
        const compressed = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.8,
          maxSizeMB: 2
        })
        
        setCompressedFile(compressed)
        
        // Hiển thị preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(compressed)
        
        // Set file to input
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(compressed)
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) {
          fileInput.files = dataTransfer.files
        }
      } catch (error: any) {
        console.error('Error compressing image:', error)
        alert('Error processing image. Please try again.')
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })

      // Sử dụng compressed file nếu có, nếu không thì dùng file từ input
      if (compressedFile) {
        submitData.append('image', compressedFile)
      } else if (imagePreview) {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput?.files?.[0]) {
          submitData.append('image', fileInput.files[0])
        }
      }

      await api.post('/issues', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Reset form
      setFormData({
        issue: '',
        area: '',
        requestedBy: user?.fullName || '',
        department: user?.department || '',
        priority: 'Normal',
        requestedDeadline: '',
        estimatedCompletionTime: '',
      })
      setImagePreview(null)
      setCompressedFile(null)

      if (onSuccess) {
        onSuccess()
      } else {
        alert('Issue created successfully!')
        router.push('/issues')
      }
    } catch (error: any) {
        alert(error.message || 'An error occurred while creating the issue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Issue <span className="text-red-500">*</span>
        </label>
        <textarea
          name="issue"
          value={formData.issue}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Describe the issue..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Area <span className="text-red-500">*</span>
          </label>
          <select
            name="area"
            value={formData.area}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Select Area --</option>
            <option value="Lobby">Lobby</option>
            <option value="FO Office">FO Office</option>
            <option value="The Dining Room">The Dining Room</option>
            <option value="Meeting Room">Meeting Room</option>
            <option value="Creative Workshop">Creative Workshop</option>
            <option value="Entertainment Room">Entertainment Room</option>
            <option value="Kid Club">Kid Club</option>
            <option value="FB Office">FB Office</option>
            <option value="Main Kitchen">Main Kitchen</option>
            <option value="Sound Kitchen">Sound Kitchen</option>
            <option value="Kit Office">Kit Office</option>
            <option value="Ocean Bistro">Ocean Bistro</option>
            <option value="GYM Black">GYM Black</option>
            <option value="GYM White">GYM White</option>
            <option value="Main Pool">Main Pool</option>
            <option value="Wellness Centre">Wellness Centre</option>
            <option value="Booking Room">Booking Room</option>
            <option value="HR Office">HR Office</option>
            <option value="AC Office">AC Office</option>
            <option value="SM Office">SM Office</option>
            <option value="HK Office">HK Office</option>
            <option value="SEC Office">SEC Office</option>
            <option value="1101">1101</option>
            <option value="1102">1102</option>
            <option value="1103">1103</option>
            <option value="1104">1104</option>
            <option value="1201">1201</option>
            <option value="1202">1202</option>
            <option value="1203">1203</option>
            <option value="1204">1204</option>
            <option value="1401">1401</option>
            <option value="1402">1402</option>
            <option value="1403">1403</option>
            <option value="1404">1404</option>
            <option value="1501">1501</option>
            <option value="1502">1502</option>
            <option value="1503">1503</option>
            <option value="1504">1504</option>
            <option value="1601">1601</option>
            <option value="1602">1602</option>
            <option value="1603">1603</option>
            <option value="1604">1604</option>
            <option value="1701">1701</option>
            <option value="1702">1702</option>
            <option value="1703">1703</option>
            <option value="1704">1704</option>
            <option value="1801">1801</option>
            <option value="1802">1802</option>
            <option value="1803">1803</option>
            <option value="1804">1804</option>
            <option value="1901">1901</option>
            <option value="1902">1902</option>
            <option value="1903">1903</option>
            <option value="1904">1904</option>
            <option value="2001">2001</option>
            <option value="2002">2002</option>
            <option value="2003">2003</option>
            <option value="2004">2004</option>
            <option value="2101">2101</option>
            <option value="2102">2102</option>
            <option value="2103">2103</option>
            <option value="2104">2104</option>
            <option value="2201">2201</option>
            <option value="2202">2202</option>
            <option value="2203">2203</option>
            <option value="2204">2204</option>
            <option value="2301">2301</option>
            <option value="2302">2302</option>
            <option value="2303">2303</option>
            <option value="2304">2304</option>
            <option value="2401">2401</option>
            <option value="2402">2402</option>
            <option value="2403">2403</option>
            <option value="2404">2404</option>
            <option value="2501">2501</option>
            <option value="2502">2502</option>
            <option value="2503">2503</option>
            <option value="2504">2504</option>
            <option value="2601">2601</option>
            <option value="2602">2602</option>
            <option value="2603">2603</option>
            <option value="2604">2604</option>
            <option value="2701">2701</option>
            <option value="2702">2702</option>
            <option value="2703">2703</option>
            <option value="2704">2704</option>
            <option value="2801">2801</option>
            <option value="2802">2802</option>
            <option value="2803">2803</option>
            <option value="2804">2804</option>
            <option value="2901">2901</option>
            <option value="2902">2902</option>
            <option value="2903">2903</option>
            <option value="2904">2904</option>
            <option value="3001">3001</option>
            <option value="3002">3002</option>
            <option value="3003">3003</option>
            <option value="3004">3004</option>
            <option value="3101">3101</option>
            <option value="3102">3102</option>
            <option value="3103">3103</option>
            <option value="3104">3104</option>
            <option value="4001">4001</option>
            <option value="4002">4002</option>
            <option value="4003">4003</option>
            <option value="4004">4004</option>
            <option value="5001">5001</option>
            <option value="5002">5002</option>
            <option value="5003">5003</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requested by <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="requestedBy"
            value={formData.requestedBy}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Requester name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Select Department --</option>
            <option value="Front Office">Front Office</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Wellness Centre">Wellness Centre</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Human Resource">Human Resource</option>
            <option value="Accounting">Accounting</option>
            <option value="Executive Office">Executive Office</option>
            <option value="Sales & Marketing">Sales & Marketing</option>
            <option value="IT">IT</option>
            <option value="Reservation">Reservation</option>
            <option value="MOD">MOD</option>
            <option value="Kitchen">Kitchen</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority <span className="text-red-500">*</span>
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
            <option value="Highest">Highest</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requested Deadline <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="requestedDeadline"
            value={formData.requestedDeadline}
            onChange={handleChange}
            required
            className="w-full max-w-[180px] px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Completion Time
          </label>
          <input
            type="date"
            name="estimatedCompletionTime"
            value={formData.estimatedCompletionTime}
            onChange={handleChange}
            className="w-full max-w-[180px] px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
        <div className="mt-1">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-indigo-400 transition-colors"
          >
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="file-upload"
              />
            </label>
          </div>
        </div>
        {imagePreview && (
          <div className="mt-4 relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-full h-auto max-h-64 rounded-lg border shadow-sm"
            />
            <button
              type="button"
              onClick={() => {
                setImagePreview(null)
                setCompressedFile(null)
                const fileInput = document.getElementById('file-upload') as HTMLInputElement
                if (fileInput) fileInput.value = ''
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition shadow-md"
              aria-label="Remove image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-row items-center justify-center gap-2 md:gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 md:flex-none px-3 md:px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 md:flex-none px-3 md:px-4 py-2 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition flex items-center justify-center"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

