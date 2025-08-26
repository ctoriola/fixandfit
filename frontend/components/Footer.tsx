import React from 'react'
import Link from 'next/link'
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  HeartIcon 
} from '@heroicons/react/24/outline'

const Footer: React.FC = () => {
  const footerLinks = {
    services: [
      { name: 'Prosthetics', href: '/services/prosthetics' },
      { name: 'Orthotics', href: '/services/orthotics' },
      { name: 'Podorthotics', href: '/services/podorthotics' },
      { name: 'Virtual Consultations', href: '/services/virtual-consultations' },
    ],
    products: [
      { name: 'Upper Limb Prosthetics', href: '/products/upper-limb' },
      { name: 'Lower Limb Prosthetics', href: '/products/lower-limb' },
      { name: 'Spinal Orthotics', href: '/products/spinal-orthotics' },
      { name: 'Diabetic Footwear', href: '/products/diabetic-footwear' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Team', href: '/team' },
      { name: 'Careers', href: '/careers' },
      { name: 'News & Updates', href: '/news' },
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Patient Resources', href: '/resources' },
      { name: 'Insurance', href: '/insurance' },
    ],
  }

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="container-max section-padding py-16">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F&F</span>
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold">Fix and Fit</h3>
                <p className="text-secondary-300 text-sm">Making you fit again</p>
              </div>
            </div>
            
            <p className="text-secondary-300 leading-relaxed">
              Empowering patients with personalized, high-quality prosthetics, orthotics, 
              and podorthotics solutions through highly trained and certified professionals.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-5 h-5 text-primary-400" />
                <span className="text-secondary-300">+234 123 456 7890</span>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-primary-400" />
                <span className="text-secondary-300">info@fixandfit.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPinIcon className="w-5 h-5 text-primary-400" />
                <span className="text-secondary-300">123 Medical Center Drive, Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-secondary-300 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Products</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-secondary-300 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-secondary-300 hover:text-primary-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-secondary-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-secondary-400">
              <span>&copy; 2024 Fix and Fit. All rights reserved.</span>
              <Link href="/privacy" className="hover:text-primary-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary-400 transition-colors">
                Terms of Service
              </Link>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-secondary-400">
              <span>Made with</span>
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span>for better mobility</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
