import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { 
  UserIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Recipient {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  profileImage?: string
}

const ComposeMessage: NextPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [formData, setFormData] = useState({
    recipientId: '',
    subject: '',
    content: '',
    messageType: 'general',
    priority: 'normal',
  })
  const [loading, setLoading] = useState(false)
  const [loadingRecipients, setLoadingRecipients] = useState(true)

  const messageTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'appointment', label: 'Appointment Related' },
    { value: 'consultation', label: 'Consultation Related' },
    { value: 'support', label: 'Support Request' },
  ]

  const priorities = [
    { value: 'low', label: 'Low Priority' },
    { value: 'normal', label: 'Normal Priority' },
    { value: 'high', label: 'High Priority' },
    { value: 'urgent', label: 'Urgent' },
  ]

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchRecipients()
  }, [user, router])

  const fetchRecipients = async () => {
    try {
      setLoadingRecipients(true)
      const response = await axios.get('/api/messages/recipients')
      setRecipients(response.data.data.recipients)
    } catch (error: any) {
      toast.error('Failed to fetch recipients')
    } finally {
      setLoadingRecipients(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.recipientId || !formData.subject.trim() || !formData.content.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      await axios.post('/api/messages', {
        recipientId: formData.recipientId,
        subject: formData.subject,
        content: formData.content,
        messageType: formData.messageType,
        priority: formData.priority,
      })
      
      toast.success('Message sent successfully!')
      router.push('/messages')
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const getSelectedRecipient = () => {
    return recipients.find(r => r._id === formData.recipientId)
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
        <title>Compose Message - Fix and Fit</title>
        <meta name="description" content="Send a message to our admin team" />
      </Head>

      <Layout>
        <div className="py-8 bg-secondary-50 min-h-screen">
          <div className="container-max section-padding">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              {/* Header */}
              <div className="flex items-center mb-6">
                <button
                  onClick={() => router.back()}
                  className="mr-4 p-2 text-secondary-600 hover:text-secondary-900 rounded-lg hover:bg-secondary-100 transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">
                    Compose Message
                  </h1>
                  <p className="text-secondary-600">
                    Send a message to our admin team
                  </p>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2">
                  <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Recipient Selection */}
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          To *
                        </label>
                        {loadingRecipients ? (
                          <div className="flex items-center py-3">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                            <span className="text-secondary-600">Loading recipients...</span>
                          </div>
                        ) : (
                          <select
                            name="recipientId"
                            value={formData.recipientId}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="">Select a recipient</option>
                            {recipients.map((recipient) => (
                              <option key={recipient._id} value={recipient._id}>
                                {recipient.firstName} {recipient.lastName} ({recipient.role})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Message Type */}
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Message Type
                        </label>
                        <select
                          name="messageType"
                          value={formData.messageType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {messageTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Priority
                        </label>
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          {priorities.map((priority) => (
                            <option key={priority.value} value={priority.value}>
                              {priority.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Subject *
                        </label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          maxLength={200}
                          placeholder="Enter message subject"
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="text-right text-xs text-secondary-500 mt-1">
                          {formData.subject.length}/200
                        </div>
                      </div>

                      {/* Message Content */}
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Message *
                        </label>
                        <textarea
                          name="content"
                          value={formData.content}
                          onChange={handleInputChange}
                          required
                          rows={8}
                          maxLength={2000}
                          placeholder="Type your message here..."
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <div className="text-right text-xs text-secondary-500 mt-1">
                          {formData.content.length}/2000
                        </div>
                      </div>

                      {/* Action Buttons */}
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
                          disabled={loading || !formData.recipientId || !formData.subject.trim() || !formData.content.trim()}
                          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Sending...
                            </>
                          ) : (
                            <>
                              <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                  {/* Selected Recipient Info */}
                  {getSelectedRecipient() && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="card mb-6"
                    >
                      <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                        Recipient
                      </h3>
                      
                      <div className="flex items-center space-x-3">
                        {getSelectedRecipient()?.profileImage ? (
                          <img
                            src={getSelectedRecipient()?.profileImage}
                            alt="Profile"
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-primary-600" />
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-medium text-secondary-900">
                            {getSelectedRecipient()?.firstName} {getSelectedRecipient()?.lastName}
                          </h4>
                          <p className="text-sm text-secondary-600">
                            {getSelectedRecipient()?.role}
                          </p>
                          <p className="text-sm text-secondary-500">
                            {getSelectedRecipient()?.email}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Guidelines */}
                  <div className="card">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                      Messaging Guidelines
                    </h3>
                    
                    <div className="space-y-3 text-sm text-secondary-600">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Be clear and specific about your inquiry or request</p>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Include relevant appointment or consultation details if applicable</p>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Use appropriate priority levels - urgent should be reserved for emergencies</p>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p>Our admin team typically responds within 24 hours during business days</p>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-red-800 mb-1">
                            Emergency Contact
                          </h4>
                          <p className="text-sm text-red-700">
                            For urgent medical issues, please call our emergency line at{' '}
                            <span className="font-medium">(555) 123-HELP</span> or visit the nearest emergency room.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default ComposeMessage
