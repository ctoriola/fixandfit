import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { motion } from 'framer-motion'
import { 
  UsersIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'
import toast from 'react-hot-toast'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
  lastLogin?: string
  phone?: string
}

const AdminUsersPage: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || user.role !== 'admin') return
      
      try {
        const response = await axios.get('/api/users')
        setUsers(response.data.data.users)
        setFilteredUsers(response.data.data.users)
      } catch (error) {
        toast.error('Failed to load users')
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [user])

  useEffect(() => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      )
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      await axios.patch(`/api/users/${userId}/role`, { role: newRole })
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u))
      toast.success('User role updated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user role')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await axios.delete(`/api/users/${userId}`)
      setUsers(users.filter(u => u._id !== userId))
      toast.success('User deleted successfully')
      setShowDeleteConfirm(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'staff':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading || !user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Head>
        <title>User Management - Fix and Fit Admin</title>
        <meta name="description" content="Manage users in the Fix and Fit system." />
      </Head>

      <Layout>
        <div className="py-8 bg-secondary-50 min-h-screen">
          <div className="container-max section-padding">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">
                  User Management
                </h1>
                <p className="text-secondary-600">
                  Manage user accounts, roles, and permissions.
                </p>
              </div>
              
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="btn-outline"
              >
                Back to Dashboard
              </button>
            </motion.div>

            {/* Filters and Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card mb-8"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Role Filter */}
                <div>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">Users</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 text-sm text-secondary-600">
                Showing {filteredUsers.length} of {users.length} users
              </div>
            </motion.div>

            {/* Users Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="card overflow-hidden"
            >
              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary-50 border-b border-secondary-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-secondary-900">User</th>
                        <th className="text-left py-3 px-4 font-medium text-secondary-900">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-secondary-900">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-secondary-900">Joined</th>
                        <th className="text-left py-3 px-4 font-medium text-secondary-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="border-b border-secondary-100 hover:bg-secondary-25">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-secondary-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-secondary-600">{user.email}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                              className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getRoleColor(user.role)}`}
                            >
                              <option value="user">User</option>
                              <option value="staff">Staff</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-secondary-600">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user)
                                  setShowUserModal(true)
                                }}
                                className="p-1 text-secondary-600 hover:text-primary-600"
                                title="View Details"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </button>
                              
                              {user._id !== user._id && (
                                <button
                                  onClick={() => setShowDeleteConfirm(user._id)}
                                  className="p-1 text-secondary-600 hover:text-red-600"
                                  title="Delete User"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8">
                      <UsersIcon className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
                      <p className="text-secondary-600">No users found matching your criteria</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                User Details
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-secondary-700">Name:</span>
                  <p className="text-secondary-900">{selectedUser.firstName} {selectedUser.lastName}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-secondary-700">Email:</span>
                  <p className="text-secondary-900">{selectedUser.email}</p>
                </div>
                
                {selectedUser.phone && (
                  <div>
                    <span className="text-sm font-medium text-secondary-700">Phone:</span>
                    <p className="text-secondary-900">{selectedUser.phone}</p>
                  </div>
                )}
                
                <div>
                  <span className="text-sm font-medium text-secondary-700">Role:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-secondary-700">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    selectedUser.isActive 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-secondary-700">Joined:</span>
                  <p className="text-secondary-900">{formatDate(selectedUser.createdAt)}</p>
                </div>
                
                {selectedUser.lastLogin && (
                  <div>
                    <span className="text-sm font-medium text-secondary-700">Last Login:</span>
                    <p className="text-secondary-900">{formatDate(selectedUser.lastLogin)}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => {
                    setShowUserModal(false)
                    setSelectedUser(null)
                  }}
                  className="flex-1 btn-outline"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Confirm Delete
              </h3>
              
              <p className="text-secondary-600 mb-6">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </Layout>
    </>
  )
}

export default AdminUsersPage
