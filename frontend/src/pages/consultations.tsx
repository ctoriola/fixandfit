import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { motion } from 'framer-motion'
import { 
  VideoCameraIcon, 
  CalendarIcon, 
  ClockIcon,
  UserIcon,
  PlayIcon,
  EyeIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Consultation {
  _id: string
  roomId: string
  status: string
  startTime: string
  endTime: string
  actualStartTime?: string
  actualEndTime?: string
  duration?: number
  patient: {
    _id: string
    firstName: string
    lastName: string
  }
  practitioner: {
    _id: string
    firstName: string
    lastName: string
  }
  appointment: {
    _id: string
    appointmentType: string
    reason: string
  }
  notes?: string
  feedback?: {
    patientRating?: number
    practitionerRating?: number
    patientFeedback?: string
    practitionerFeedback?: string
  }
}

const ConsultationsPage: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loadingConsultations, setLoadingConsultations] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [showFeedbackModal, setShowFeedbackModal] = useState<string | null>(null)
  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: '',
    technicalRating: 5
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchConsultations = async () => {
      if (!user) return
      
      try {
        const response = await axios.get('/api/consultations/my-consultations', {
          params: { limit: 50 }
        })
        setConsultations(response.data.data.consultations)
      } catch (error) {
        toast.error('Failed to load consultations')
      } finally {
        setLoadingConsultations(false)
      }
    }

    fetchConsultations()
  }, [user])

  const filteredConsultations = consultations.filter(consultation => {
    if (filter === 'all') return true
    return consultation.status === filter
  })

  const joinConsultation = (roomId: string) => {
    router.push(`/consultation/${roomId}`)
  }

  const createConsultation = async (appointmentId: string) => {
    try {
      const response = await axios.post(`/api/consultations/appointment/${appointmentId}`)
      const consultation = response.data.data.consultation
      toast.success('Consultation room created')
      router.push(`/consultation/${consultation.roomId}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create consultation')
    }
  }

  const submitFeedback = async (consultationId: string) => {
    try {
      await axios.patch(`/api/consultations/${consultationId}/feedback`, {
        rating: feedback.rating,
        feedback: feedback.comment,
        technicalRating: feedback.technicalRating
      })
      toast.success('Feedback submitted successfully')
      setShowFeedbackModal(null)
      setFeedback({ rating: 5, comment: '', technicalRating: 5 })
      
      // Refresh consultations
      const response = await axios.get('/api/consultations/my-consultations', {
        params: { limit: 50 }
      })
      setConsultations(response.data.data.consultations)
    } catch (error) {
      toast.error('Failed to submit feedback')
    }
  }

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
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canJoinConsultation = (consultation: Consultation) => {
    const now = new Date()
    const startTime = new Date(consultation.startTime)
    const timeDiff = startTime.getTime() - now.getTime()
    const minutesDiff = timeDiff / (1000 * 60)
    
    return consultation.status === 'scheduled' && minutesDiff <= 15 && minutesDiff >= -60
  }

  const needsFeedback = (consultation: Consultation) => {
    if (consultation.status !== 'completed') return false
    
    const userFeedback = user?._id === consultation.patient._id 
      ? consultation.feedback?.patientRating
      : consultation.feedback?.practitionerRating
      
    return !userFeedback
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

  return (
    <>
      <Head>
        <title>Virtual Consultations - Fix and Fit</title>
        <meta name="description" content="Manage your virtual consultations with Fix and Fit." />
      </Head>

      <Layout>
        <div className="py-8 bg-secondary-50 min-h-screen">
          <div className="container-max section-padding">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">
                Virtual Consultations
              </h1>
              <p className="text-secondary-600">
                Join your scheduled virtual consultations or review past sessions.
              </p>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="card mb-8"
            >
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All Consultations' },
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filter === option.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Consultations List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-6"
            >
              {loadingConsultations ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : filteredConsultations.length > 0 ? (
                filteredConsultations.map((consultation) => (
                  <div key={consultation._id} className="card hover:shadow-soft transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <VideoCameraIcon className="w-6 h-6 text-primary-600" />
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-secondary-900 capitalize">
                            {consultation.appointment.appointmentType.replace('-', ' ')}
                          </h3>
                          <p className="text-secondary-600 mb-2">
                            with {
                              user._id === consultation.patient._id 
                                ? `Dr. ${consultation.practitioner.firstName} ${consultation.practitioner.lastName}`
                                : `${consultation.patient.firstName} ${consultation.patient.lastName}`
                            }
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-secondary-500">
                            <div className="flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {formatDate(consultation.startTime)}
                            </div>
                            <div className="flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              {formatTime(consultation.startTime)} - {formatTime(consultation.endTime)}
                            </div>
                            {consultation.duration && (
                              <div className="flex items-center">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                {consultation.duration} min
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(consultation.status)}`}>
                          {consultation.status}
                        </span>
                        
                        {consultation.status === 'active' && (
                          <button
                            onClick={() => joinConsultation(consultation.roomId)}
                            className="btn-primary flex items-center space-x-2"
                          >
                            <PlayIcon className="w-4 h-4" />
                            <span>Join Now</span>
                          </button>
                        )}
                        
                        {canJoinConsultation(consultation) && (
                          <button
                            onClick={() => joinConsultation(consultation.roomId)}
                            className="btn-primary flex items-center space-x-2"
                          >
                            <VideoCameraIcon className="w-4 h-4" />
                            <span>Join</span>
                          </button>
                        )}
                        
                        {needsFeedback(consultation) && (
                          <button
                            onClick={() => setShowFeedbackModal(consultation._id)}
                            className="btn-outline flex items-center space-x-2"
                          >
                            <StarIcon className="w-4 h-4" />
                            <span>Rate</span>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {consultation.appointment.reason && (
                      <div className="bg-secondary-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-secondary-700">
                          <strong>Reason:</strong> {consultation.appointment.reason}
                        </p>
                      </div>
                    )}
                    
                    {consultation.notes && (
                      <div className="bg-secondary-50 rounded-lg p-3">
                        <p className="text-sm text-secondary-700">
                          <strong>Notes:</strong> {consultation.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <VideoCameraIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    No consultations found
                  </h3>
                  <p className="text-secondary-600 mb-6">
                    {filter === 'all' 
                      ? "You don't have any virtual consultations yet."
                      : `No ${filter} consultations found.`
                    }
                  </p>
                  <button
                    onClick={() => router.push('/appointments')}
                    className="btn-primary"
                  >
                    Schedule an Appointment
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Feedback Modal */}
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Rate Your Consultation
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Overall Rating
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFeedback({...feedback, rating: star})}
                        className={`w-8 h-8 ${
                          star <= feedback.rating 
                            ? 'text-yellow-400' 
                            : 'text-secondary-300'
                        }`}
                      >
                        <StarIcon className="w-full h-full fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Technical Quality
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFeedback({...feedback, technicalRating: star})}
                        className={`w-8 h-8 ${
                          star <= feedback.technicalRating 
                            ? 'text-yellow-400' 
                            : 'text-secondary-300'
                        }`}
                      >
                        <StarIcon className="w-full h-full fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Comments (Optional)
                  </label>
                  <textarea
                    value={feedback.comment}
                    onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Share your experience..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-6">
                <button
                  onClick={() => {
                    setShowFeedbackModal(null)
                    setFeedback({ rating: 5, comment: '', technicalRating: 5 })
                  }}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => submitFeedback(showFeedbackModal)}
                  className="flex-1 btn-primary"
                >
                  Submit Feedback
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </Layout>
    </>
  )
}

export default ConsultationsPage
