import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast from 'react-hot-toast'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: 'user' | 'admin' | 'staff'
  phone?: string
  profileImage?: string
  dateOfBirth?: string
  address?: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
  updateUser: (userData: User) => void
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const API_URL = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:3001/api'

  // Configure axios base URL
  axios.defaults.baseURL = API_URL

  // Set up axios defaults and check for saved token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token')
        console.log('Checking for saved token:', savedToken ? 'Found' : 'Not found')
        
        if (savedToken && savedToken !== 'null' && savedToken !== 'undefined') {
          console.log('Token value:', savedToken.substring(0, 20) + '...')
          // Validate token format before using it
          const tokenParts = savedToken.split('.')
          console.log('Token parts count:', tokenParts.length)
          if (tokenParts.length === 3) {
            console.log('Valid token format, setting up auth...')
            setToken(savedToken)
            axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`
            // Verify token is still valid
            await verifyToken(savedToken)
          } else {
            // Invalid token format, clear it
            console.log('Invalid token format, clearing... Parts:', tokenParts.length)
            localStorage.removeItem('token')
            setLoading(false)
          }
        } else {
          console.log('No valid token found, user not logged in. Token value:', savedToken)
          setLoading(false)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Clear any invalid token
        localStorage.removeItem('token')
        setLoading(false)
      }
    }

    // Only run on client side
    if (typeof window !== 'undefined') {
      initializeAuth()
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      console.log('Verifying token with backend...')
      // Validate token format first
      if (!token || token.split('.').length !== 3) {
        console.log('Token format validation failed')
        throw new Error('Invalid token format')
      }
      
      // Use axios instance with the token
      const response = await axios.get('/auth/me')
      console.log('Backend response:', response.status, response.data)
      
      if (response.data && response.data.data && response.data.data.user) {
        setUser(response.data.data.user)
        console.log('Token verified successfully, user restored:', response.data.data.user.email)
      } else {
        console.log('Invalid response format from backend')
        throw new Error('Invalid response format')
      }
      setLoading(false)
    } catch (error: any) {
      console.error('Token verification failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
      // Token is invalid, remove it
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        console.log('Removed invalid token from localStorage')
      }
      setToken(null)
      setUser(null)
      delete axios.defaults.headers.common['Authorization']
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await axios.post('/auth/login', {
        email,
        password,
      })

      console.log('Full login response:', response.data)
      
      // Extract token and user from response
      const responseData = response.data
      const newToken = responseData.token
      const userData = responseData.data?.user || responseData.user
      
      console.log('Extracted token:', newToken)
      console.log('Extracted user:', userData)
      console.log('Login successful, saving token:', newToken ? 'Token received' : 'No token')
      
      setToken(newToken)
      setUser(userData)
      if (typeof window !== 'undefined' && newToken) {
        localStorage.setItem('token', newToken)
        console.log('Token saved to localStorage')
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      toast.success('Login successful!')
      router.push('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true)
      const response = await axios.post('/auth/register', userData)

      // Extract token and user from response
      const responseData = response.data
      const newToken = responseData.token
      const newUser = responseData.data?.user || responseData.user
      
      setToken(newToken)
      setUser(newUser)
      if (typeof window !== 'undefined' && newToken) {
        localStorage.setItem('token', newToken)
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      toast.success('Registration successful!')
      router.push('/dashboard')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    delete axios.defaults.headers.common['Authorization']
    toast.success('Logged out successfully')
    router.push('/')
  }

  const updateUser = (userData: User) => {
    setUser(userData)
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
