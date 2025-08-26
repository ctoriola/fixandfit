import React from 'react'
import { motion } from 'framer-motion'
import { 
  HeartIcon, 
  UserGroupIcon, 
  CogIcon, 
  AcademicCapIcon,
  VideoCameraIcon,
  ClockIcon 
} from '@heroicons/react/24/outline'

const Services: React.FC = () => {
  const services = [
    {
      icon: HeartIcon,
      title: 'Prosthetics',
      description: 'Custom-fitted prosthetic limbs designed for comfort, functionality, and natural appearance.',
      features: ['Upper & Lower Limb', 'Cosmetic Solutions', 'Sports Prosthetics'],
    },
    {
      icon: CogIcon,
      title: 'Orthotics',
      description: 'Supportive devices to correct, align, and improve the function of movable parts of the body.',
      features: ['Spinal Orthotics', 'Limb Braces', 'Foot Orthotics'],
    },
    {
      icon: UserGroupIcon,
      title: 'Podorthotics',
      description: 'Specialized foot care solutions including diabetic footwear and custom insoles.',
      features: ['Diabetic Shoes', 'Custom Insoles', 'Foot Assessment'],
    },
    {
      icon: VideoCameraIcon,
      title: 'Virtual Consultations',
      description: 'Remote consultations with our certified professionals from the comfort of your home.',
      features: ['Online Assessment', 'Follow-up Care', 'Document Sharing'],
    },
    {
      icon: AcademicCapIcon,
      title: 'Education & Training',
      description: 'Comprehensive education programs for patients and healthcare professionals.',
      features: ['Patient Education', 'Professional Training', 'Workshops'],
    },
    {
      icon: ClockIcon,
      title: '24/7 Support',
      description: 'Round-the-clock support for emergency adjustments and patient care.',
      features: ['Emergency Care', 'Maintenance', 'Technical Support'],
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container-max section-padding">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-heading font-bold text-secondary-900 mb-4"
          >
            Our Comprehensive Services
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-secondary-600 max-w-3xl mx-auto"
          >
            We provide a complete range of prosthetic, orthotic, and podorthotic services 
            with international quality standards and personalized care.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card hover:shadow-medium transition-shadow duration-300 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-secondary-900">
                  {service.title}
                </h3>
              </div>
              
              <p className="text-secondary-600 mb-6 leading-relaxed">
                {service.description}
              </p>
              
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-sm text-secondary-700">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <p className="text-secondary-600 mb-6">
            Ready to start your journey to better mobility?
          </p>
          <button className="btn-primary text-lg px-8 py-4">
            Schedule a Consultation
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default Services
