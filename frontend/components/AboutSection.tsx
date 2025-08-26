import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircleIcon, GlobeAltIcon, AcademicCapIcon, HeartIcon } from '@heroicons/react/24/solid'

const AboutSection: React.FC = () => {
  const values = [
    {
      icon: HeartIcon,
      title: 'Patient-Centered Care',
      description: 'Every solution is tailored to individual needs and lifestyle requirements.',
    },
    {
      icon: AcademicCapIcon,
      title: 'Expert Professionals',
      description: 'Highly trained and certified professionals with years of experience.',
    },
    {
      icon: GlobeAltIcon,
      title: 'International Quality',
      description: 'Partnerships with leading brands from Germany, USA, UK, France, Japan, and Italy.',
    },
    {
      icon: CheckCircleIcon,
      title: 'Proven Results',
      description: 'Over 500 satisfied patients with successful rehabilitation outcomes.',
    },
  ]

  const partners = [
    'Germany', 'USA', 'UK', 'France', 'Japan', 'Italy'
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container-max section-padding">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-secondary-900">
                About Fix and Fit
              </h2>
              
              <div className="space-y-4 text-secondary-600 leading-relaxed">
                <p>
                  <strong className="text-secondary-800">Our Mission:</strong> To empower patients by providing 
                  personalized, high-quality prosthetics, orthotics, and podorthotics solutions through 
                  highly trained and certified professionals.
                </p>
                
                <p>
                  <strong className="text-secondary-800">Our Vision:</strong> To build a sustainable and 
                  leading company in Africa where adequate and complete prosthetic and orthotic services 
                  will be rendered to the people by competent professionals.
                </p>
                
                <p>
                  With over 15 years of experience and partnerships with international brands, we combine 
                  global expertise with local understanding to deliver exceptional care and outcomes.
                </p>
              </div>
            </div>

            {/* International Partners */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-secondary-800">
                International Partnerships
              </h3>
              <div className="flex flex-wrap gap-3">
                {partners.map((country, index) => (
                  <motion.span
                    key={country}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium"
                  >
                    {country}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Values Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid sm:grid-cols-2 gap-6"
          >
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center group hover:shadow-medium transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-sm text-secondary-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 bg-gradient-to-r from-primary-600 to-accent-500 rounded-2xl p-8 md:p-12 text-white"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-heading font-bold mb-4">
              Our Impact in Numbers
            </h3>
            <p className="text-primary-100 max-w-2xl mx-auto">
              These numbers represent real lives transformed and mobility restored through our dedication to excellence.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">500+</div>
              <div className="text-primary-100">Patients Served</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">15+</div>
              <div className="text-primary-100">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">98%</div>
              <div className="text-primary-100">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">6</div>
              <div className="text-primary-100">Countries Partnership</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default AboutSection
