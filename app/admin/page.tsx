'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/Auth/ProtectedRoute'
import SlideInModal from '@/components/Modal/SlideInModal'

function AdminContent() {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    department: '',
    role: 'User',
    email: '',
  })

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchUsers()
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response: any = await api.get('/admin/users')
      // API interceptor đã extract response.data, nên response có thể là array hoặc object
      const usersData = Array.isArray(response) ? response : (response?.data || [])
      setUsers(usersData)
    } catch (error: any) {
      console.error('Error fetching users:', error)
      alert(error.message || 'Failed to fetch users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/admin/users', formData)
      alert('User created successfully!')
      setShowCreateModal(false)
      // Reset form
      setFormData({
        username: '',
        password: '',
        fullName: '',
        department: '',
        role: 'User',
        email: '',
      })
      fetchUsers()
    } catch (error: any) {
      alert(error.message || 'An error occurred')
    }
  }

  const handleEditClick = (user: any) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: '', // Không hiển thị password
      fullName: user.fullName,
      department: user.department,
      role: user.role,
      email: user.email || '',
    })
    setShowEditModal(true)
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    
    try {
      // Chỉ gửi các field đã thay đổi, không gửi password nếu không có
      const updateData: any = {
        fullName: formData.fullName,
        department: formData.department,
        role: formData.role,
        email: formData.email,
      }
      
      // Chỉ gửi password nếu có giá trị mới
      if (formData.password) {
        updateData.password = formData.password
      }
      
      await api.put(`/admin/users/${editingUser.id}`, updateData)
      alert('User updated successfully!')
      setShowEditModal(false)
      setEditingUser(null)
      // Reset form
      setFormData({
        username: '',
        password: '',
        fullName: '',
        department: '',
        role: 'User',
        email: '',
      })
      fetchUsers()
    } catch (error: any) {
      alert(error.message || 'An error occurred')
    }
  }

  if (user?.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">Only Admin can access this page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 User Management</h1>
            <p className="text-gray-600">Create and manage staff accounts</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
          >
            + Create New Account
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.fullName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.department}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.email || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button 
                            onClick={() => handleEditClick(u)}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No users yet. Create the first user!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        <SlideInModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="➕ Create New Account"
          size="md"
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select --</option>
                  <option value="IT">IT</option>
                  <option value="Front Office">Front Office</option>
                  <option value="Engineering">Engineering</option>
                  <option value="MOD">MOD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="User">User</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </SlideInModal>

        {/* Edit User Modal */}
        <SlideInModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setEditingUser(null)
            setFormData({
              username: '',
              password: '',
              fullName: '',
              department: '',
              role: 'User',
              email: '',
            })
          }}
          title="✏️ Edit User"
          size="md"
        >
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password (leave blank to keep current)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter new password or leave blank"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select --</option>
                  <option value="IT">IT</option>
                  <option value="Front Office">Front Office</option>
                  <option value="Engineering">Engineering</option>
                  <option value="MOD">MOD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="User">User</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Update User
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingUser(null)
                  setFormData({
                    username: '',
                    password: '',
                    fullName: '',
                    department: '',
                    role: 'User',
                    email: '',
                  })
                }}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </SlideInModal>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  )
}

