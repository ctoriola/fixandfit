import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRightIcon, StarIcon } from '@heroicons/react/24/solid'
import { EyeIcon } from '@heroicons/react/24/outline'

const FeaturedProducts: React.FC = () => {
  const featuredProducts = [
    {
      id: 1,
      name: 'Below Elbow Prosthesis',
      category: 'Prosthetics',
      price: 'From $2,500',
      rating: 4.8,
      reviews: 24,
      image: '/api/placeholder/300/300',
      description: 'Advanced myoelectric prosthetic arm with natural grip patterns and intuitive control.',
      features: ['Myoelectric Control', 'Waterproof Design', 'Quick Disconnect'],
    },
    {
      id: 2,
      name: 'Bilateral Ankle Foot Orthosis',
      category: 'Orthotics',
      price: 'From $800',
      rating: 4.9,
      reviews: 18,
      image: '/api/placeholder/300/300',
      description: 'Lightweight carbon fiber AFO providing superior support and mobility.',
      features: ['Carbon Fiber', 'Custom Fit', 'Adjustable Straps'],
    },
    {
      id: 3,
      name: 'Diabetic Heel Offloading Shoe',
      category: 'Footwear',
      price: 'From $150',
      rating: 4.7,
      reviews: 32,
      image: '/api/placeholder/300/300',
      description: 'Specialized footwear designed to reduce pressure on diabetic foot ulcers.',
      features: ['Pressure Relief', 'Breathable Material', 'Easy Adjustment'],
    },
    {
      id: 4,
      name: 'Silicon Finger Prosthesis',
      category: 'Prosthetics',
      price: 'From $400',
      rating: 4.6,
      reviews: 15,
      image: '/api/placeholder/300/300',
      description: 'Realistic silicone finger prosthesis with natural skin tone matching.',
      features: ['Custom Color Match', 'Flexible Material', 'Easy Attachment'],
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
            Featured Products
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-secondary-600 max-w-3xl mx-auto"
          >
            Discover our most popular prosthetic and orthotic solutions, 
            crafted with precision and designed for your comfort.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden group"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
                <div className="w-32 h-32 bg-white rounded-lg shadow-soft flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary-600">{product.category[0]}</span>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-10 h-10 bg-white rounded-full shadow-soft flex items-center justify-center hover:bg-primary-50">
                    <EyeIcon className="w-5 h-5 text-primary-600" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="mb-2">
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-secondary-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {product.name}
                </h3>
                
                <p className="text-sm text-secondary-600 mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Features */}
                <ul className="space-y-1 mb-4">
                  {product.features.slice(0, 2).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-xs text-secondary-600">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400'
                            : 'text-secondary-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-secondary-600 ml-2">
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-secondary-900">
                    {product.price}
                  </div>
                  <button className="btn-primary text-sm px-4 py-2">
                    Learn More
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link
            href="/products"
            className="btn-outline text-lg px-8 py-4 group"
          >
            View All Products
            <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturedProducts
