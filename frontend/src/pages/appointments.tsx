import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { CalendarIcon, ClockIcon, UserIcon, VideoCameraIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import axios from 'axios'

interface AppointmentFormData {
  appointmentType: string
  date: string
  time: string
  reason: string
  isVirtual: boolean
}

interface TimeSlot {
  startTime: string
  endTime: string
}


const AppointmentsPage: NextPage = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>()

  const watchedDate = watch('date')

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])


  // Fetch available slots when date changes
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!watchedDate) {
        setAvailableSlots([])
        return
      }

      setLoadingSlots(true)
      try {
        const response = await axios.get('/appointments/available-slots', {
          params: {
            date: watchedDate,
          },
        })
        setAvailableSlots(response.data.data.availableSlots)
      } catch (error) {
        toast.error('Failed to load available slots')
        setAvailableSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchAvailableSlots()
  }, [watchedDate])

  const onSubmit = async (data: AppointmentFormData) => {
    if (!data.time) {
      toast.error('Please select a time slot')
      return
    }

    setSubmitting(true)
    try {
      const selectedSlot = availableSlots.find(slot => slot.startTime === data.time)
      if (!selectedSlot) {
        toast.error('Invalid time slot selected')
        return
      }

      await axios.post('/appointments', {
        appointmentType: data.appointmentType,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason: data.reason,
        isVirtual: data.isVirtual,
      })

      toast.success('Appointment booked successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to book appointment'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const appointmentTypes = [
    { value: 'consultation', label: 'Initial Consultation' },
    { value: 'fitting', label: 'Device Fitting' },
    { value: 'follow-up', label: 'Follow-up Visit' },
    { value: 'adjustment', label: 'Device Adjustment' },
    { value: 'virtual-consultation', label: 'Virtual Consultation' },
  ]

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Head>
        <title>Book Appointment - Fix and Fit</title>
        <meta name="description" content="Book an appointment with our expert prosthetic and orthotic professionals." />
      </Head>

      <Layout>
        <div className="py-12 bg-secondary-50 min-h-screen">
          <div className="container-max section-padding">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-secondary-900 mb-4">
                  Book an Appointment
                </h1>
                <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
                  Schedule a consultation with our admin team to discuss your prosthetic and orthotic needs.
                </p>
              </div>

              {/* Appointment Form */}
              <div className="bg-white rounded-xl shadow-soft p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Appointment Type */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-3">
                      Appointment Type
                    </label>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {appointmentTypes.map((type) => (
                        <label
                          key={type.value}
                          className="relative flex items-center p-4 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors"
                        >
                          <input
                            {...register('appointmentType', { required: 'Please select an appointment type' })}
                            type="radio"
                            value={type.value}
                            className="sr-only"
                          />
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-secondary-300 rounded-full mr-3 flex items-center justify-center">
                              <div className="w-2 h-2 bg-primary-600 rounded-full opacity-0 peer-checked:opacity-100"></div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-secondary-900">{type.label}</div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    {errors.appointmentType && (
                      <p className="mt-2 text-sm text-red-600">{errors.appointmentType.message}</p>
                    )}
                  </div>

                  {/* Admin Info */}
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <UserIcon className="w-5 h-5 text-primary-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-primary-800 mb-1">
                          Appointment with Admin Team
                        </h4>
                        <p className="text-sm text-primary-700">
                          Your appointment will be automatically scheduled with our qualified admin team who will provide 
                          personalized care and support for all your prosthetic and orthotic needs.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Preferred Date
                    </label>
                    <input
                      {...register('date', { required: 'Please select a date' })}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className={`input ${errors.date ? 'border-red-500' : ''}`}
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                    )}
                  </div>

                  {/* Time Slots */}
                  {watchedDate && (
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-3">
                        Available Time Slots
                      </label>
                      {loadingSlots ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                          <span className="ml-2 text-secondary-600">Loading available slots...</span>
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {availableSlots.map((slot) => (
                            <label
                              key={slot.startTime}
                              className="relative flex items-center justify-center p-3 border border-secondary-200 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors"
                            >
                              <input
                                {...register('time', { required: 'Please select a time slot' })}
                                type="radio"
                                value={slot.startTime}
                                className="sr-only peer"
                              />
                              <div className="text-sm font-medium text-secondary-900 peer-checked:text-primary-600">
                                {formatTime(slot.startTime)}
                              </div>
                              <div className="absolute inset-0 border-2 border-transparent peer-checked:border-primary-600 rounded-lg"></div>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-secondary-600">
                          No available slots for the selected date. Please choose a different date.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Reason for Appointment
                    </label>
                    <textarea
                      {...register('reason', { required: 'Please provide a reason for the appointment' })}
                      rows={4}
                      className={`input resize-none ${errors.reason ? 'border-red-500' : ''}`}
                      placeholder="Please describe your needs, symptoms, or the purpose of this appointment..."
                    />
                    {errors.reason && (
                      <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
                    )}
                  </div>

                  {/* Virtual Consultation Option */}
                  <div className="flex items-center">
                    <input
                      {...register('isVirtual')}
                      id="isVirtual"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="isVirtual" className="ml-2 flex items-center text-sm text-secondary-700">
                      <VideoCameraIcon className="w-4 h-4 mr-1" />
                      Request virtual consultation (if applicable)
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-secondary-200">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Booking Appointment...' : 'Book Appointment'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default AppointmentsPage
