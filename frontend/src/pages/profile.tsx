import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { motion } from 'framer-motion'
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  CameraIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import axios from 'axios'
import toast from 'react-hot-toast'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

const ProfilePage: NextPage = () => {
  const { user, loading, updateUser } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          postalCode: user.address?.postalCode || '',
          country: user.address?.country || ''
        }
      })
    }
  }, [user])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const response = await axios.patch('/api/users/updateMe', profile)
      updateUser(response.data.data.user)
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setSaving(true)
    try {
      await axios.patch('/api/auth/updatePassword', {
        passwordCurrent: passwordForm.currentPassword,
        password: passwordForm.newPassword,
        passwordConfirm: passwordForm.confirmPassword
      })
      toast.success('Password updated successfully')
      setShowPasswordForm(false)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password')
    } finally {
      setSaving(false)
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

  return (
    <>
      <Head>
        <title>Profile - Fix and Fit</title>
        <meta name="description" content="Manage your profile information with Fix and Fit." />
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
              <div className="card mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                      <UserIcon className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-heading font-bold text-secondary-900">
                        {user.firstName} {user.lastName}
                      </h1>
                      <p className="text-secondary-600">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="btn-primary"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setIsEditing(false)
                            // Reset form to original values
                            if (user) {
                              setProfile({
                                firstName: user.firstName || '',
                                lastName: user.lastName || '',
                                email: user.email || '',
                                phone: user.phone || '',
                                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
                                address: {
                                  street: user.address?.street || '',
                                  city: user.address?.city || '',
                                  state: user.address?.state || '',
                                  postalCode: user.address?.postalCode || '',
                                  country: user.address?.country || ''
                                }
                              })
                            }
                          }}
                          className="btn-outline"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="btn-primary"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="card"
                >
                  <h2 className="text-xl font-heading font-semibold text-secondary-900 mb-6">
                    Personal Information
                  </h2>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          First Name
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                          <input
                            type="text"
                            value={profile.firstName}
                            onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                            disabled={!isEditing}
                            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                              isEditing 
                                ? 'border-secondary-300 bg-white' 
                                : 'border-secondary-200 bg-secondary-50'
                            }`}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Last Name
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                          <input
                            type="text"
                            value={profile.lastName}
                            onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                            disabled={!isEditing}
                            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                              isEditing 
                                ? 'border-secondary-300 bg-white' 
                                : 'border-secondary-200 bg-secondary-50'
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({...profile, email: e.target.value})}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            isEditing 
                              ? 'border-secondary-300 bg-white' 
                              : 'border-secondary-200 bg-secondary-50'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({...profile, phone: e.target.value})}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            isEditing 
                              ? 'border-secondary-300 bg-white' 
                              : 'border-secondary-200 bg-secondary-50'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                        <input
                          type="date"
                          value={profile.dateOfBirth}
                          onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            isEditing 
                              ? 'border-secondary-300 bg-white' 
                              : 'border-secondary-200 bg-secondary-50'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Address Information */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="card"
                >
                  <h2 className="text-xl font-heading font-semibold text-secondary-900 mb-6">
                    Address Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Street Address
                      </label>
                      <div className="relative">
                        <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                        <input
                          type="text"
                          value={profile.address.street}
                          onChange={(e) => setProfile({
                            ...profile, 
                            address: {...profile.address, street: e.target.value}
                          })}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            isEditing 
                              ? 'border-secondary-300 bg-white' 
                              : 'border-secondary-200 bg-secondary-50'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={profile.address.city}
                          onChange={(e) => setProfile({
                            ...profile, 
                            address: {...profile.address, city: e.target.value}
                          })}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            isEditing 
                              ? 'border-secondary-300 bg-white' 
                              : 'border-secondary-200 bg-secondary-50'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={profile.address.state}
                          onChange={(e) => setProfile({
                            ...profile, 
                            address: {...profile.address, state: e.target.value}
                          })}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            isEditing 
                              ? 'border-secondary-300 bg-white' 
                              : 'border-secondary-200 bg-secondary-50'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={profile.address.postalCode}
                          onChange={(e) => setProfile({
                            ...profile, 
                            address: {...profile.address, postalCode: e.target.value}
                          })}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            isEditing 
                              ? 'border-secondary-300 bg-white' 
                              : 'border-secondary-200 bg-secondary-50'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          value={profile.address.country}
                          onChange={(e) => setProfile({
                            ...profile, 
                            address: {...profile.address, country: e.target.value}
                          })}
                          disabled={!isEditing}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            isEditing 
                              ? 'border-secondary-300 bg-white' 
                              : 'border-secondary-200 bg-secondary-50'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Security Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="card mt-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-heading font-semibold text-secondary-900">
                    Security Settings
                  </h2>
                  
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="btn-outline"
                  >
                    <LockClosedIcon className="w-5 h-5 mr-2" />
                    Change Password
                  </button>
                </div>

                {showPasswordForm && (
                  <form onSubmit={handlePasswordUpdate} className="space-y-4 border-t pt-6">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false)
                          setPasswordForm({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          })
                        }}
                        className="btn-outline"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary"
                      >
                        {saving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default ProfilePage
