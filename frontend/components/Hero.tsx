import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline'

const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-accent-50 overflow-hidden">
      <div className="container-max section-padding py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-secondary-900 leading-tight"
              >
                Making You{' '}
                <span className="text-gradient">Fit Again</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg md:text-xl text-secondary-600 leading-relaxed max-w-2xl"
              >
                Empowering patients with personalized, high-quality prosthetics, orthotics, 
                and podorthotics solutions through highly trained and certified professionals.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/appointments"
                className="btn-primary text-lg px-8 py-4 group"
              >
                Book Consultation
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="btn-outline text-lg px-8 py-4 group">
                <PlayIcon className="w-5 h-5 mr-2" />
                Watch Our Story
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-3 gap-8 pt-8 border-t border-secondary-200"
            >
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-600">500+</div>
                <div className="text-sm text-secondary-600">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-600">15+</div>
                <div className="text-sm text-secondary-600">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary-600">6</div>
                <div className="text-sm text-secondary-600">Countries Served</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Image/Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl p-8 shadow-medium">
              {/* Placeholder for hero image */}
              <div className="aspect-square bg-white rounded-xl shadow-soft flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-accent-500 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">F&F</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-secondary-800">Professional Care</h3>
                    <p className="text-secondary-600">Expert prosthetics & orthotics solutions</p>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent-500 rounded-full opacity-20 animate-bounce-subtle"></div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-primary-500 rounded-full opacity-20 animate-bounce-subtle" style={{ animationDelay: '1s' }}></div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-50 to-transparent opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-tr from-accent-50 to-transparent opacity-30"></div>
    </section>
  )
}

export default Hero
