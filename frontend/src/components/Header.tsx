import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import { Bars3Icon, XMarkIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Services', href: '/services' },
    { name: 'Education', href: '/education' },
    { name: 'Consultations', href: '/consultations' },
    { name: 'Messages', href: '/messages' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const isActive = (href: string) => {
    return router.pathname === href
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-max section-padding">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F&F</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-heading font-bold text-secondary-800">Fix and Fit</h1>
              <p className="text-xs text-secondary-500">Making you fit again</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-primary-600 border-b-2 border-primary-600 pb-1'
                    : 'text-secondary-600 hover:text-primary-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/appointments"
                  className="btn-outline flex items-center space-x-2"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Book Appointment</span>
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-secondary-600 hover:text-primary-600">
                    <UserIcon className="w-5 h-5" />
                    <span className="text-sm font-medium">{user.firstName}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-outline">
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-secondary-600 hover:text-primary-600 hover:bg-secondary-50"
          >
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-secondary-200 mt-2 pt-4 pb-4"
            >
              <nav className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-base font-medium ${
                      isActive(item.href)
                        ? 'text-primary-600'
                        : 'text-secondary-600 hover:text-primary-600'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {user ? (
                  <div className="pt-4 border-t border-secondary-200 space-y-4">
                    <Link
                      href="/appointments"
                      className="btn-outline w-full justify-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Book Appointment
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block text-base font-medium text-secondary-600 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="block text-base font-medium text-secondary-600 hover:text-primary-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin/dashboard"
                        className="block text-base font-medium text-secondary-600 hover:text-primary-600"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left text-base font-medium text-secondary-600 hover:text-primary-600"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-secondary-200 space-y-4">
                    <Link
                      href="/login"
                      className="btn-outline w-full justify-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="btn-primary w-full justify-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

export default Header
