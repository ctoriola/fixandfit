import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { 
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'
import toast from 'react-hot-toast'

interface TimeSlot {
  startTime: string
  endTime: string
}

const BookAppointment: NextPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    appointmentType: 'consultation',
    selectedDate: '',
    selectedTime: '',
    reason: '',
    isVirtual: false,
  })
  
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const appointmentTypes = [
    { value: 'consultation', label: 'Initial Consultation', duration: '60 min' },
    { value: 'fitting', label: 'Fitting Appointment', duration: '90 min' },
    { value: 'follow-up', label: 'Follow-up Visit', duration: '45 min' },
    { value: 'adjustment', label: 'Adjustment Session', duration: '30 min' },
    { value: 'virtual-consultation', label: 'Virtual Consultation', duration: '45 min' },
  ]

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  useEffect(() => {
    if (formData.selectedDate) {
      fetchAvailableSlots()
    }
  }, [formData.selectedDate])

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true)
      const response = await axios.get('/appointments/available-slots', {
        params: { date: formData.selectedDate }
      })
      setAvailableSlots(response.data.data.availableSlots)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch available slots')
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Reset selected time when date changes
    if (name === 'selectedDate') {
      setFormData(prev => ({ ...prev, selectedTime: '' }))
    }

    // Auto-set virtual for virtual consultation type
    if (name === 'appointmentType' && value === 'virtual-consultation') {
      setFormData(prev => ({ ...prev, isVirtual: true }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.selectedDate || !formData.selectedTime || !formData.reason.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      // Create start and end times
      const [hours, minutes] = formData.selectedTime.split(':')
      const startTime = new Date(formData.selectedDate)
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      
      const endTime = new Date(startTime)
      const duration = formData.appointmentType === 'fitting' ? 90 : 
                      formData.appointmentType === 'consultation' ? 60 :
                      formData.appointmentType === 'follow-up' || formData.appointmentType === 'virtual-consultation' ? 45 : 30
      endTime.setMinutes(endTime.getMinutes() + duration)

      const appointmentData = {
        appointmentType: formData.appointmentType,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        reason: formData.reason,
        isVirtual: formData.isVirtual || formData.appointmentType === 'virtual-consultation',
      }

      const response = await axios.post('/appointments', appointmentData)
      
      toast.success('Appointment booked successfully!')
      router.push('/dashboard')
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book appointment')
    } finally {
      setLoading(false)
    }
  }

  const formatTimeSlot = (slot: TimeSlot) => {
    const start = new Date(slot.startTime)
    const end = new Date(slot.endTime)
    return `${start.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })} - ${end.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })}`
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3) // 3 months ahead
    return maxDate.toISOString().split('T')[0]
  }

  if (!user) {
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
        <title>Book Appointment - Fix and Fit</title>
        <meta name="description" content="Book your appointment with Fix and Fit" />
      </Head>

      <Layout>
        <div className="py-8 bg-secondary-50 min-h-screen">
          <div className="container-max section-padding">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-4">
                  Book an Appointment
                </h1>
                <p className="text-secondary-600">
                  Schedule your appointment with our admin team for personalized care and support.
                </p>
              </div>

              <div className="card">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Appointment Type */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                      Appointment Type *
                    </label>
                    <select
                      name="appointmentType"
                      value={formData.appointmentType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {appointmentTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label} ({type.duration})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      name="selectedDate"
                      value={formData.selectedDate}
                      onChange={handleInputChange}
                      min={getMinDate()}
                      max={getMaxDate()}
                      required
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Time Selection */}
                  {formData.selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        Available Time Slots *
                      </label>
                      
                      {loadingSlots ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                          <span className="ml-2 text-secondary-600">Loading available slots...</span>
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {availableSlots.map((slot, index) => {
                            const slotTime = new Date(slot.startTime).toTimeString().slice(0, 5)
                            return (
                              <label key={index} className="cursor-pointer">
                                <input
                                  type="radio"
                                  name="selectedTime"
                                  value={slotTime}
                                  checked={formData.selectedTime === slotTime}
                                  onChange={handleInputChange}
                                  className="sr-only"
                                />
                                <div className={`p-3 border rounded-lg text-center transition-colors ${
                                  formData.selectedTime === slotTime
                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                    : 'border-secondary-300 hover:border-primary-300'
                                }`}>
                                  <div className="text-sm font-medium">
                                    {formatTimeSlot(slot)}
                                  </div>
                                </div>
                              </label>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-secondary-500">
                          No available slots for this date. Please select another date.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Virtual Appointment Option */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isVirtual"
                      checked={formData.isVirtual}
                      onChange={handleInputChange}
                      disabled={formData.appointmentType === 'virtual-consultation'}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label className="ml-2 text-sm text-secondary-700">
                      <VideoCameraIcon className="w-4 h-4 inline mr-1" />
                      Virtual appointment (video call)
                      {formData.appointmentType === 'virtual-consultation' && (
                        <span className="text-primary-600 ml-1">(Required for virtual consultation)</span>
                      )}
                    </label>
                  </div>

                  {/* Reason for Appointment */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Reason for Appointment *
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      rows={4}
                      required
                      placeholder="Please describe the reason for your appointment, any specific concerns, or what you'd like to discuss..."
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
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
                          Your appointment will be with our qualified admin team who will provide 
                          personalized care and support for all your prosthetic and orthotic needs.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Location Info */}
                  {!formData.isVirtual && (
                    <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <BuildingOfficeIcon className="w-5 h-5 text-secondary-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-secondary-800 mb-1">
                            Clinic Location
                          </h4>
                          <p className="text-sm text-secondary-700">
                            Fix and Fit Clinic<br />
                            123 Healthcare Avenue<br />
                            Medical District, City 12345<br />
                            Phone: (555) 123-4567
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="flex-1 px-6 py-3 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !formData.selectedTime}
                      className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Booking...' : 'Book Appointment'}
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

export default BookAppointment
