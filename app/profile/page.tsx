'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'
import { compressImage } from '@/lib/imageCompress'

function ProfileContent() {
  const { user, login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'avatar'>('profile')
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    department: user?.department || '',
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [compressedAvatarFile, setCompressedAvatarFile] = useState<File | null>(null)

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // TODO: Tạo API endpoint để cập nhật profile
      // await api.put('/auth/profile', profileData)
      alert('Profile updated successfully!')
    } catch (error: any) {
      alert(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!')
      return
    }
    setLoading(true)
    try {
      // TODO: Tạo API endpoint để đổi mật khẩu
      // await api.post('/auth/change-password', passwordData)
      alert('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      alert(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        // Compress image nếu cần (avatar nhỏ hơn, max 800x800)
        const compressed = await compressImage(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.85,
          maxSizeMB: 2
        })
        
        setCompressedAvatarFile(compressed)
        
        // Hiển thị preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setAvatarPreview(reader.result as string)
        }
        reader.readAsDataURL(compressed)
      } catch (error: any) {
        console.error('Error compressing image:', error)
        alert('Error processing image. Please try again.')
      }
    }
  }

  const handleAvatarDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      try {
        // Compress image nếu cần (avatar nhỏ hơn, max 800x800)
        const compressed = await compressImage(file, {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.85,
          maxSizeMB: 2
        })
        
        setCompressedAvatarFile(compressed)
        
        // Hiển thị preview
        const reader = new FileReader()
        reader.onloadend = () => {
          setAvatarPreview(reader.result as string)
        }
        reader.readAsDataURL(compressed)
        
        // Set file to input
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(compressed)
        const fileInput = document.getElementById('avatar-upload') as HTMLInputElement
        if (fileInput) {
          fileInput.files = dataTransfer.files
        }
      } catch (error: any) {
        console.error('Error compressing image:', error)
        alert('Error processing image. Please try again.')
      }
    }
  }

  const handleAvatarDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleAvatarUpload = async () => {
    if (!avatarPreview || !compressedAvatarFile) return
    setLoading(true)
    try {
      // TODO: Tạo API endpoint để upload avatar
      const formData = new FormData()
      formData.append('avatar', compressedAvatarFile)
      // await api.post('/auth/avatar', formData)
      alert('Avatar updated successfully!')
      setAvatarPreview(null)
      setCompressedAvatarFile(null)
    } catch (error: any) {
      alert(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">👤 Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="text-center mb-4">
                <div className="w-24 h-24 bg-indigo-600 rounded-full mx-auto flex items-center justify-center text-white text-3xl font-bold mb-3">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h3 className="font-semibold text-gray-900">{user?.fullName}</h3>
                <p className="text-sm text-gray-500">{user?.department}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  user?.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                      activeTab === 'profile'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Personal Information
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                      activeTab === 'password'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => setActiveTab('avatar')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                      activeTab === 'avatar'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Avatar
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              {activeTab === 'profile' && (
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={profileData.department}
                      disabled
                      className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Department cannot be changed</p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'password' && (
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'avatar' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Avatar
                    </label>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                      <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-4 border-gray-300 shadow-md flex-shrink-0">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-4xl text-gray-400 font-bold">
                            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 w-full">
                        <div
                          onDrop={handleAvatarDrop}
                          onDragOver={handleAvatarDragOver}
                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <label htmlFor="avatar-upload" className="flex flex-col items-center justify-center cursor-pointer">
                            <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-600">
                              <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                            <input
                              type="file"
                              id="avatar-upload"
                              accept="image/*"
                              onChange={handleAvatarChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {avatarPreview && (
                    <div className="flex gap-4">
                      <button
                        onClick={handleAvatarUpload}
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
                      >
                        {loading ? 'Uploading...' : 'Update Avatar'}
                      </button>
                      <button
                        onClick={() => {
                          setAvatarPreview(null)
                          setCompressedAvatarFile(null)
                          const fileInput = document.getElementById('avatar-upload') as HTMLInputElement
                          if (fileInput) fileInput.value = ''
                        }}
                        className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}

