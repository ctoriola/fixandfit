import React, { useState, useEffect, useRef } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { 
  VideoCameraIcon, 
  VideoCameraSlashIcon,
  MicrophoneIcon,
  SpeakerXMarkIcon,
  PhoneXMarkIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Consultation {
  _id: string
  roomId: string
  status: string
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
  startTime: string
  endTime: string
  notes?: string
  patientNotes?: string
  practitionerNotes?: string
}

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: Date
  type: 'text' | 'system'
}

const ConsultationRoom: NextPage = () => {
  const router = useRouter()
  const { roomId } = router.query
  const { user, loading } = useAuth()
  
  // Video/Audio refs
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  
  // State
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...')
  const [showChat, setShowChat] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [notes, setNotes] = useState('')
  const [loadingConsultation, setLoadingConsultation] = useState(true)

  // Load consultation data
  useEffect(() => {
    if (!roomId || loading) return

    const fetchConsultation = async () => {
      try {
        const response = await axios.get(`/api/consultations/room/${roomId}`)
        setConsultation(response.data.data.consultation)
        setNotes(response.data.data.consultation.notes || '')
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load consultation')
        router.push('/dashboard')
      } finally {
        setLoadingConsultation(false)
      }
    }

    fetchConsultation()
  }, [roomId, loading, router])

  // Initialize WebRTC
  useEffect(() => {
    if (!consultation || !user) return

    initializeWebRTC()

    return () => {
      cleanup()
    }
  }, [consultation, user])

  const initializeWebRTC = async () => {
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      })

      peerConnectionRef.current = peerConnection

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream)
      })

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
        setIsConnected(true)
        setConnectionStatus('Connected')
      }

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        setConnectionStatus(peerConnection.connectionState)
        if (peerConnection.connectionState === 'connected') {
          setIsConnected(true)
        } else if (peerConnection.connectionState === 'disconnected' || 
                   peerConnection.connectionState === 'failed') {
          setIsConnected(false)
        }
      }

      // Join consultation
      await axios.patch(`/api/consultations/${consultation?._id}/join`)
      
      addChatMessage('system', `${user.firstName} ${user.lastName} joined the consultation`)

    } catch (error) {
      console.error('Failed to initialize WebRTC:', error)
      toast.error('Failed to access camera/microphone')
      setConnectionStatus('Failed to connect')
    }
  }

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const endCall = async () => {
    try {
      if (user?.role === 'staff' || user?.role === 'admin') {
        await axios.patch(`/api/consultations/${consultation?._id}/end`, {
          notes
        })
        toast.success('Consultation ended successfully')
      } else {
        await axios.patch(`/api/consultations/${consultation?._id}/leave`)
      }
      
      cleanup()
      router.push('/dashboard')
    } catch (error) {
      toast.error('Failed to end consultation')
    }
  }

  const addChatMessage = (sender: string, message: string, type: 'text' | 'system' = 'text') => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender,
      message,
      timestamp: new Date(),
      type
    }
    setChatMessages(prev => [...prev, newMsg])
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !user) return
    
    addChatMessage(`${user.firstName} ${user.lastName}`, newMessage)
    setNewMessage('')
  }

  const saveNotes = async () => {
    try {
      await axios.patch(`/api/consultations/${consultation?._id}/notes`, {
        notes,
        type: user?.role === 'staff' || user?.role === 'admin' ? 'practitioner' : 'patient'
      })
      toast.success('Notes saved successfully')
    } catch (error) {
      toast.error('Failed to save notes')
    }
  }

  const startConsultation = async () => {
    try {
      await axios.patch(`/api/consultations/${consultation?._id}/start`)
      setConsultation(prev => prev ? { ...prev, status: 'active' } : null)
      toast.success('Consultation started')
    } catch (error) {
      toast.error('Failed to start consultation')
    }
  }

  if (loading || loadingConsultation) {
    return (
      <div className="min-h-screen bg-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-white">Loading consultation...</p>
        </div>
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-secondary-900 flex items-center justify-center">
        <div className="text-center text-white">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">Consultation Not Found</h1>
          <p className="mb-4">The consultation room you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Virtual Consultation - Fix and Fit</title>
        <meta name="description" content="Virtual consultation room for Fix and Fit." />
      </Head>

      <div className="min-h-screen bg-secondary-900 text-white">
        {/* Header */}
        <div className="bg-secondary-800 px-6 py-4 border-b border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                Consultation with {
                  user?._id === consultation.patient._id 
                    ? `Dr. ${consultation.practitioner.firstName} ${consultation.practitioner.lastName}`
                    : `${consultation.patient.firstName} ${consultation.patient.lastName}`
                }
              </h1>
              <p className="text-secondary-400 text-sm capitalize">
                {consultation.appointment.appointmentType.replace('-', ' ')} • {consultation.status}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isConnected 
                  ? 'bg-green-600 text-white'
                  : 'bg-yellow-600 text-white'
              }`}>
                {connectionStatus}
              </div>
              
              {consultation.status === 'scheduled' && (user?.role === 'staff' || user?.role === 'admin') && (
                <button
                  onClick={startConsultation}
                  className="btn-primary text-sm"
                >
                  Start Consultation
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Main Video Area */}
          <div className="flex-1 relative">
            {/* Remote Video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover bg-secondary-800"
            />
            
            {/* Local Video (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-64 h-48 bg-secondary-800 rounded-lg overflow-hidden border-2 border-secondary-600">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 bg-secondary-700 flex items-center justify-center">
                  <VideoCameraSlashIcon className="w-8 h-8 text-secondary-400" />
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-4 bg-secondary-800 bg-opacity-90 backdrop-blur-sm rounded-full px-6 py-3">
                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-colors ${
                    isVideoEnabled 
                      ? 'bg-secondary-600 hover:bg-secondary-500'
                      : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  {isVideoEnabled ? (
                    <VideoCameraIcon className="w-6 h-6" />
                  ) : (
                    <VideoCameraSlashIcon className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full transition-colors ${
                    isAudioEnabled 
                      ? 'bg-secondary-600 hover:bg-secondary-500'
                      : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  {isAudioEnabled ? (
                    <MicrophoneIcon className="w-6 h-6" />
                  ) : (
                    <SpeakerXMarkIcon className="w-6 h-6" />
                  )}
                </button>

                <button
                  onClick={() => setShowChat(!showChat)}
                  className="p-3 rounded-full bg-secondary-600 hover:bg-secondary-500 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setShowNotes(!showNotes)}
                  className="p-3 rounded-full bg-secondary-600 hover:bg-secondary-500 transition-colors"
                >
                  <DocumentTextIcon className="w-6 h-6" />
                </button>

                <button
                  onClick={endCall}
                  className="p-3 rounded-full bg-red-600 hover:bg-red-500 transition-colors"
                >
                  <PhoneXMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          {(showChat || showNotes) && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 400 }}
              exit={{ width: 0 }}
              className="bg-secondary-800 border-l border-secondary-700 overflow-hidden"
            >
              {/* Panel Header */}
              <div className="p-4 border-b border-secondary-700">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowChat(true)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      showChat 
                        ? 'bg-primary-600 text-white'
                        : 'text-secondary-400 hover:text-white'
                    }`}
                  >
                    Chat
                  </button>
                  <button
                    onClick={() => setShowNotes(true)}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      showNotes 
                        ? 'bg-primary-600 text-white'
                        : 'text-secondary-400 hover:text-white'
                    }`}
                  >
                    Notes
                  </button>
                </div>
              </div>

              {/* Chat Panel */}
              {showChat && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-3">
                      {chatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`${
                            msg.type === 'system'
                              ? 'text-center text-secondary-400 text-sm'
                              : 'text-left'
                          }`}
                        >
                          {msg.type !== 'system' && (
                            <div className="text-xs text-secondary-400 mb-1">
                              {msg.sender} • {msg.timestamp.toLocaleTimeString()}
                            </div>
                          )}
                          <div className={`${
                            msg.type === 'system'
                              ? 'italic'
                              : 'bg-secondary-700 rounded-lg p-3'
                          }`}>
                            {msg.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-secondary-700">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-secondary-700 border border-secondary-600 rounded-lg px-3 py-2 text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        onClick={sendMessage}
                        className="btn-primary px-4 py-2"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes Panel */}
              {showNotes && (
                <div className="flex flex-col h-full p-4">
                  <div className="flex-1">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add consultation notes..."
                      className="w-full h-full bg-secondary-700 border border-secondary-600 rounded-lg p-3 text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <button
                      onClick={saveNotes}
                      className="btn-primary w-full"
                    >
                      Save Notes
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </>
  )
}

export default ConsultationRoom
