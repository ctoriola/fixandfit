import React from 'react'
import { motion } from 'framer-motion'
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  ClockIcon 
} from '@heroicons/react/24/outline'

const ContactSection: React.FC = () => {
  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'Phone',
      details: ['+234 123 456 7890', '+234 987 654 3210'],
      description: 'Call us for immediate assistance',
    },
    {
      icon: EnvelopeIcon,
      title: 'Email',
      details: ['info@fixandfit.com', 'appointments@fixandfit.com'],
      description: 'Send us your questions anytime',
    },
    {
      icon: MapPinIcon,
      title: 'Location',
      details: ['123 Medical Center Drive', 'Lagos, Nigeria'],
      description: 'Visit our modern facility',
    },
    {
      icon: ClockIcon,
      title: 'Hours',
      details: ['Mon - Fri: 8:00 AM - 6:00 PM', 'Sat: 9:00 AM - 4:00 PM'],
      description: 'Emergency services available 24/7',
    },
  ]

  return (
    <section className="py-20 bg-secondary-50">
      <div className="container-max section-padding">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-heading font-bold text-secondary-900 mb-4"
          >
            Get in Touch
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-secondary-600 max-w-3xl mx-auto"
          >
            Ready to start your journey to better mobility? Contact us today to schedule 
            a consultation with our expert team.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="grid sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-lg p-6 shadow-soft hover:shadow-medium transition-shadow duration-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-accent-500 rounded-lg flex items-center justify-center mr-3">
                      <info.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-secondary-900">
                      {info.title}
                    </h3>
                  </div>
                  <div className="space-y-1 mb-3">
                    {info.details.map((detail, detailIndex) => (
                      <p key={detailIndex} className="text-secondary-800 font-medium">
                        {detail}
                      </p>
                    ))}
                  </div>
                  <p className="text-sm text-secondary-600">
                    {info.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-lg p-6 text-white"
            >
              <h3 className="text-xl font-semibold mb-3">Emergency Services</h3>
              <p className="text-primary-100 mb-4">
                Need immediate assistance? Our emergency hotline is available 24/7 
                for urgent prosthetic and orthotic needs.
              </p>
              <button className="bg-white text-primary-600 px-6 py-2 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                Call Emergency Line
              </button>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-xl shadow-soft p-8"
          >
            <h3 className="text-2xl font-heading font-semibold text-secondary-900 mb-6">
              Send us a Message
            </h3>
            
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="input"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  className="input"
                  placeholder="+234 123 456 7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Service Interest
                </label>
                <select className="input">
                  <option value="">Select a service</option>
                  <option value="prosthetics">Prosthetics</option>
                  <option value="orthotics">Orthotics</option>
                  <option value="podorthotics">Podorthotics</option>
                  <option value="consultation">Virtual Consultation</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  className="input resize-none"
                  placeholder="Tell us about your needs or questions..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn-primary w-full text-lg py-3"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
