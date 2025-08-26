import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { motion } from 'framer-motion'
import { 
  CalendarIcon, 
  UserIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon 
} from '@heroicons/react/24/outline'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Appointment {
  _id: string
  appointmentType: string
  startTime: string
  endTime: string
  status: string
  reason: string
  practitioner: {
    firstName: string
    lastName: string
  }
  isVirtual: boolean
}

const DashboardPage: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingAppointments, setLoadingAppointments] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return
      
      try {
        const response = await axios.get('/appointments/my-appointments')
        setAppointments(response.data.data.appointments)
      } catch (error) {
        toast.error('Failed to load appointments')
      } finally {
        setLoadingAppointments(false)
      }
    }

    fetchAppointments()
  }, [user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />
      case 'cancelled':
        return <XCircleIcon className="w-5 h-5 text-red-600" />
      default:
        return <ClockIcon className="w-5 h-5 text-blue-600" />
    }
  }

  if (loading || !user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'scheduled' && new Date(apt.startTime) > new Date()
  )

  const recentAppointments = appointments.filter(apt => 
    apt.status === 'completed' || apt.status === 'cancelled'
  ).slice(0, 5)

  return (
    <>
      <Head>
        <title>Dashboard - Fix and Fit</title>
        <meta name="description" content="Manage your appointments and profile with Fix and Fit." />
      </Head>

      <Layout>
        <div className="py-8 bg-secondary-50 min-h-screen">
          <div className="container-max section-padding">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-secondary-600">
                Manage your appointments and track your care journey with Fix and Fit.
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid md:grid-cols-3 gap-6 mb-8"
            >
              <div className="card text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-secondary-900">{upcomingAppointments.length}</h3>
                <p className="text-secondary-600">Upcoming Appointments</p>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-secondary-900">
                  {appointments.filter(apt => apt.status === 'completed').length}
                </h3>
                <p className="text-secondary-600">Completed Sessions</p>
              </div>

              <div className="card text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <UserIcon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-secondary-900">Active</h3>
                <p className="text-secondary-600">Account Status</p>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Upcoming Appointments */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-heading font-semibold text-secondary-900">
                    Upcoming Appointments
                  </h2>
                  <button
                    onClick={() => router.push('/appointments')}
                    className="btn-primary text-sm px-4 py-2"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Book New
                  </button>
                </div>

                {loadingAppointments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="border border-secondary-200 rounded-lg p-4 hover:shadow-soft transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-secondary-900 capitalize">
                              {appointment.appointmentType.replace('-', ' ')}
                            </h3>
                            <p className="text-sm text-secondary-600">
                              Dr. {appointment.practitioner.firstName} {appointment.practitioner.lastName}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        
                        <div className="flex items-center text-sm text-secondary-600 mb-2">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {formatDate(appointment.startTime)}
                        </div>
                        
                        <div className="flex items-center text-sm text-secondary-600">
                          <ClockIcon className="w-4 h-4 mr-2" />
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          {appointment.isVirtual && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              Virtual
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
                    <p className="text-secondary-600 mb-4">No upcoming appointments</p>
                    <button
                      onClick={() => router.push('/appointments')}
                      className="btn-primary"
                    >
                      Schedule Your First Appointment
                    </button>
                  </div>
                )}
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="card"
              >
                <h2 className="text-xl font-heading font-semibold text-secondary-900 mb-6">
                  Recent Activity
                </h2>

                {recentAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {recentAppointments.map((appointment) => (
                      <div
                        key={appointment._id}
                        className="flex items-center p-3 border border-secondary-200 rounded-lg"
                      >
                        <div className="mr-3">
                          {getStatusIcon(appointment.status)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-secondary-900 capitalize">
                            {appointment.appointmentType.replace('-', ' ')}
                          </h4>
                          <p className="text-sm text-secondary-600">
                            {formatDate(appointment.startTime)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClockIcon className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
                    <p className="text-secondary-600">No recent activity</p>
                  </div>
                )}
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
                  onClick={() => router.push('/appointments')}
                  className="btn-outline text-center p-4"
                >
                  <CalendarIcon className="w-6 h-6 mx-auto mb-2" />
                  Book Appointment
                </button>
                
                <button
                  onClick={() => router.push('/products')}
                  className="btn-outline text-center p-4"
                >
                  <UserIcon className="w-6 h-6 mx-auto mb-2" />
                  Browse Products
                </button>
                
                <button
                  onClick={() => router.push('/profile')}
                  className="btn-outline text-center p-4"
                >
                  <UserIcon className="w-6 h-6 mx-auto mb-2" />
                  Update Profile
                </button>
                
                <button
                  onClick={() => router.push('/contact')}
                  className="btn-outline text-center p-4"
                >
                  <UserIcon className="w-6 h-6 mx-auto mb-2" />
                  Contact Support
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default DashboardPage
