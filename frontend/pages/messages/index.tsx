import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { 
  InboxIcon,
  PaperAirplaneIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { 
  InboxIcon as InboxSolidIcon,
  ExclamationCircleIcon as ExclamationSolidIcon 
} from '@heroicons/react/24/solid'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Message {
  _id: string
  sender: {
    _id: string
    firstName: string
    lastName: string
    profileImage?: string
    role: string
  }
  recipient: {
    _id: string
    firstName: string
    lastName: string
    profileImage?: string
    role: string
  }
  subject: string
  content: string
  messageType: string
  priority: string
  isRead: boolean
  readAt?: string
  createdAt: string
  appointment?: {
    appointmentType: string
    startTime: string
    status: string
  }
  consultation?: {
    status: string
    startTime: string
  }
}

interface MessageStats {
  totalMessages: number
  unreadCount: number
  currentPage: number
  totalPages: number
}

const MessagesPage: NextPage = () => {
  const { user } = useAuth()
  
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox')
  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState<MessageStats>({
    totalMessages: 0,
    unreadCount: 0,
    currentPage: 1,
    totalPages: 1
  })
  const [loading, setLoading] = useState(true)
  const [selectedMessages, setSelectedMessages] = useState<string[]>([])
  const [filters, setFilters] = useState({
    type: '',
    unreadOnly: false,
    search: ''
  })

  useEffect(() => {
    if (user) {
      fetchMessages()
    }
  }, [user, activeTab, filters])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const endpoint = activeTab === 'inbox' ? '/api/messages/inbox' : '/api/messages/sent'
      const params = new URLSearchParams()
      
      if (filters.type) params.append('type', filters.type)
      if (filters.unreadOnly) params.append('unreadOnly', 'true')
      if (filters.search) params.append('search', filters.search)

      const response = await axios.get(`${endpoint}?${params}`)
      const data = response.data.data

      setMessages(data.messages)
      setStats({
        totalMessages: response.data.totalMessages,
        unreadCount: response.data.unreadCount || 0,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages
      })
    } catch (error: any) {
      toast.error('Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageIds: string[]) => {
    try {
      await axios.patch('/api/messages/mark-read', { messageIds })
      fetchMessages()
      toast.success('Messages marked as read')
    } catch (error) {
      toast.error('Failed to mark messages as read')
    }
  }

  const archiveMessages = async (messageIds: string[]) => {
    try {
      await Promise.all(
        messageIds.map(id => axios.patch(`/api/messages/${id}`))
      )
      fetchMessages()
      setSelectedMessages([])
      toast.success('Messages archived')
    } catch (error) {
      toast.error('Failed to archive messages')
    }
  }

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    )
  }

  const handleSelectAll = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([])
    } else {
      setSelectedMessages(messages.map(m => m._id))
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'normal': return 'text-secondary-600'
      case 'low': return 'text-secondary-400'
      default: return 'text-secondary-600'
    }
  }

  const getPriorityIcon = (priority: string) => {
    if (priority === 'urgent' || priority === 'high') {
      return <ExclamationSolidIcon className="w-4 h-4" />
    }
    return null
  }

  const getMessageTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      general: 'bg-blue-100 text-blue-800',
      appointment: 'bg-green-100 text-green-800',
      consultation: 'bg-purple-100 text-purple-800',
      support: 'bg-yellow-100 text-yellow-800',
      system: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || colors.general
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
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
        <title>Messages - Fix and Fit</title>
        <meta name="description" content="Manage your messages and communications" />
      </Head>

      <Layout>
        <div className="py-8 bg-secondary-50 min-h-screen">
          <div className="container-max section-padding">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-heading font-bold text-secondary-900 mb-2">
                    Messages
                  </h1>
                  <p className="text-secondary-600">
                    Communicate with our admin team and manage your conversations
                  </p>
                </div>
                
                <Link href="/messages/compose" className="btn-primary">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  New Message
                </Link>
              </div>

              <div className="grid lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="card p-4">
                    {/* Navigation Tabs */}
                    <div className="space-y-2 mb-6">
                      <button
                        onClick={() => setActiveTab('inbox')}
                        className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                          activeTab === 'inbox'
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-secondary-600 hover:bg-secondary-100'
                        }`}
                      >
                        <InboxIcon className="w-5 h-5 mr-3" />
                        <span>Inbox</span>
                        {stats.unreadCount > 0 && (
                          <span className="ml-auto bg-primary-600 text-white text-xs rounded-full px-2 py-1">
                            {stats.unreadCount}
                          </span>
                        )}
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('sent')}
                        className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                          activeTab === 'sent'
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-secondary-600 hover:bg-secondary-100'
                        }`}
                      >
                        <PaperAirplaneIcon className="w-5 h-5 mr-3" />
                        <span>Sent</span>
                      </button>
                    </div>

                    {/* Filters */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          Message Type
                        </label>
                        <select
                          value={filters.type}
                          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        >
                          <option value="">All Types</option>
                          <option value="general">General</option>
                          <option value="appointment">Appointment</option>
                          <option value="consultation">Consultation</option>
                          <option value="support">Support</option>
                          <option value="system">System</option>
                        </select>
                      </div>

                      {activeTab === 'inbox' && (
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.unreadOnly}
                            onChange={(e) => setFilters(prev => ({ ...prev, unreadOnly: e.target.checked }))}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                          />
                          <label className="ml-2 text-sm text-secondary-700">
                            Unread only
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div className="lg:col-span-3">
                  <div className="card">
                    {/* Toolbar */}
                    <div className="border-b border-secondary-200 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {activeTab === 'inbox' && (
                            <>
                              <button
                                onClick={handleSelectAll}
                                className="text-sm text-secondary-600 hover:text-secondary-900"
                              >
                                {selectedMessages.length === messages.length ? 'Deselect All' : 'Select All'}
                              </button>
                              
                              {selectedMessages.length > 0 && (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => markAsRead(selectedMessages)}
                                    className="text-sm text-primary-600 hover:text-primary-700"
                                  >
                                    Mark as Read
                                  </button>
                                  <button
                                    onClick={() => archiveMessages(selectedMessages)}
                                    className="text-sm text-secondary-600 hover:text-secondary-700"
                                  >
                                    Archive
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        
                        <div className="text-sm text-secondary-500">
                          {stats.totalMessages} messages
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="divide-y divide-secondary-200">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                          <span className="ml-2 text-secondary-600">Loading messages...</span>
                        </div>
                      ) : messages.length > 0 ? (
                        messages.map((message) => (
                          <div
                            key={message._id}
                            className={`p-4 hover:bg-secondary-50 transition-colors ${
                              !message.isRead && activeTab === 'inbox' ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              {activeTab === 'inbox' && (
                                <input
                                  type="checkbox"
                                  checked={selectedMessages.includes(message._id)}
                                  onChange={() => handleSelectMessage(message._id)}
                                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                                />
                              )}
                              
                              <div className="flex-shrink-0">
                                {(activeTab === 'inbox' ? message.sender : message.recipient).profileImage ? (
                                  <img
                                    src={(activeTab === 'inbox' ? message.sender : message.recipient).profileImage}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <UserIcon className="w-5 h-5 text-primary-600" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <Link href={`/messages/${message._id}`}>
                                  <div className="cursor-pointer">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center space-x-2">
                                        <span className={`font-medium ${
                                          !message.isRead && activeTab === 'inbox' 
                                            ? 'text-secondary-900' 
                                            : 'text-secondary-700'
                                        }`}>
                                          {activeTab === 'inbox' 
                                            ? `${message.sender.firstName} ${message.sender.lastName}`
                                            : `${message.recipient.firstName} ${message.recipient.lastName}`
                                          }
                                        </span>
                                        
                                        <span className={`px-2 py-1 rounded-full text-xs ${getMessageTypeColor(message.messageType)}`}>
                                          {message.messageType}
                                        </span>
                                        
                                        {getPriorityIcon(message.priority) && (
                                          <span className={getPriorityColor(message.priority)}>
                                            {getPriorityIcon(message.priority)}
                                          </span>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center space-x-2">
                                        {!message.isRead && activeTab === 'inbox' && (
                                          <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                                        )}
                                        <span className="text-sm text-secondary-500">
                                          {formatDate(message.createdAt)}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <h3 className={`text-sm mb-1 ${
                                      !message.isRead && activeTab === 'inbox' 
                                        ? 'font-semibold text-secondary-900' 
                                        : 'font-medium text-secondary-800'
                                    }`}>
                                      {message.subject}
                                    </h3>
                                    
                                    <p className="text-sm text-secondary-600 line-clamp-2">
                                      {message.content}
                                    </p>
                                    
                                    {(message.appointment || message.consultation) && (
                                      <div className="mt-2 flex items-center text-xs text-secondary-500">
                                        <ClockIcon className="w-3 h-3 mr-1" />
                                        {message.appointment && (
                                          <span>
                                            {message.appointment.appointmentType} - {' '}
                                            {new Date(message.appointment.startTime).toLocaleDateString()}
                                          </span>
                                        )}
                                        {message.consultation && (
                                          <span>
                                            Consultation - {' '}
                                            {new Date(message.consultation.startTime).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <InboxSolidIcon className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-secondary-900 mb-2">
                            No messages
                          </h3>
                          <p className="text-secondary-600">
                            {activeTab === 'inbox' 
                              ? "You don't have any messages in your inbox."
                              : "You haven't sent any messages yet."
                            }
                          </p>
                          {activeTab === 'inbox' && (
                            <Link href="/messages/compose" className="btn-primary mt-4">
                              Send your first message
                            </Link>
                          )}
                        </div>
                      )}
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

export default MessagesPage
