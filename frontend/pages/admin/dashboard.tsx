import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { motion } from 'framer-motion'
import { 
  UsersIcon, 
  CalendarIcon, 
  ShoppingBagIcon,
  ChartBarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
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
}

interface Appointment {
  _id: string
  appointmentType: string
  startTime: string
  status: string
  user: {
    firstName: string
    lastName: string
  }
  practitioner: {
    firstName: string
    lastName: string
  }
}

interface Stats {
  totalUsers: number
  activeUsers: number
  recentUsers: number
  roleStats: Array<{ _id: string; count: number }>
}

const AdminDashboard: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [adminForm, setAdminForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!user || user.role !== 'admin') return
      
      try {
        const [statsRes, usersRes, appointmentsRes] = await Promise.all([
          axios.get('/api/users/stats'),
          axios.get('/api/users?limit=5&sort=-createdAt'),
          axios.get('/appointments?limit=5&sort=-createdAt')
        ])

        setStats(statsRes.data.data)
        setRecentUsers(usersRes.data.data.users)
        setRecentAppointments(appointmentsRes.data.data.appointments)
      } catch (error) {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [user])

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await axios.post('/api/users/create-admin', adminForm)
      toast.success('Admin user created successfully')
      setShowCreateAdmin(false)
      setAdminForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: ''
      })
      // Refresh data
      window.location.reload()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create admin user')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
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
        <title>Admin Dashboard - Fix and Fit</title>
        <meta name="description" content="Admin dashboard for Fix and Fit management." />
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
                  Admin Dashboard
                </h1>
                <p className="text-secondary-600">
                  Manage users, appointments, and system settings.
                </p>
              </div>
              
              <button
                onClick={() => setShowCreateAdmin(true)}
                className="btn-primary"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Admin
              </button>
            </motion.div>

            {/* Stats Cards */}
            {loadingData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              >
                <div className="card text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <UsersIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-900">{stats?.totalUsers || 0}</h3>
                  <p className="text-secondary-600">Total Users</p>
                </div>

                <div className="card text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <UsersIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-900">{stats?.activeUsers || 0}</h3>
                  <p className="text-secondary-600">Active Users</p>
                </div>

                <div className="card text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CalendarIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-900">{recentAppointments.length}</h3>
                  <p className="text-secondary-600">Recent Appointments</p>
                </div>

                <div className="card text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <ChartBarIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary-900">{stats?.recentUsers || 0}</h3>
                  <p className="text-secondary-600">New This Month</p>
                </div>
              </motion.div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Users */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-heading font-semibold text-secondary-900">
                    Recent Users
                  </h2>
                  <button
                    onClick={() => router.push('/admin/users')}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-secondary-900">
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className="text-sm text-secondary-600">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'staff'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                        <p className="text-xs text-secondary-500 mt-1">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Appointments */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-heading font-semibold text-secondary-900">
                    Recent Appointments
                  </h2>
                  <button
                    onClick={() => router.push('/admin/appointments')}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {recentAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-secondary-900 capitalize">
                          {appointment.appointmentType.replace('-', ' ')}
                        </h4>
                        <p className="text-sm text-secondary-600">
                          {appointment.user.firstName} {appointment.user.lastName}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : appointment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status}
                        </span>
                        <p className="text-xs text-secondary-500 mt-1">
                          {formatDate(appointment.startTime)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-8 card"
            >
              <h2 className="text-xl font-heading font-semibold text-secondary-900 mb-6">
                Quick Actions
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => router.push('/admin/users')}
                  className="btn-outline text-center p-4"
                >
                  <UsersIcon className="w-6 h-6 mx-auto mb-2" />
                  Manage Users
                </button>
                
                <button
                  onClick={() => router.push('/admin/appointments')}
                  className="btn-outline text-center p-4"
                >
                  <CalendarIcon className="w-6 h-6 mx-auto mb-2" />
                  Manage Appointments
                </button>
                
                <button
                  onClick={() => router.push('/admin/products')}
                  className="btn-outline text-center p-4"
                >
                  <ShoppingBagIcon className="w-6 h-6 mx-auto mb-2" />
                  Manage Products
                </button>
                
                <button
                  onClick={() => router.push('/admin/reports')}
                  className="btn-outline text-center p-4"
                >
                  <ChartBarIcon className="w-6 h-6 mx-auto mb-2" />
                  View Reports
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Create Admin Modal */}
        {showCreateAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Create Admin User
              </h3>
              
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={adminForm.firstName}
                      onChange={(e) => setAdminForm({...adminForm, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={adminForm.lastName}
                      onChange={(e) => setAdminForm({...adminForm, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={adminForm.email}
                    onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={adminForm.phone}
                    onChange={(e) => setAdminForm({...adminForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateAdmin(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    Create Admin
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </Layout>
    </>
  )
}

export default AdminDashboard
