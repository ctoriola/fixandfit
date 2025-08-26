import { NextPage } from 'next'
import Head from 'next/head'
import Layout from '@/components/Layout'
import Hero from '@/components/Hero'
import FeaturedProducts from '@/components/FeaturedProducts'
import Services from '@/components/Services'
import AboutSection from '@/components/AboutSection'
import ContactSection from '@/components/ContactSection'

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Fix and Fit - Making You Fit Again | Prosthetics & Orthotics</title>
        <meta
          name="description"
          content="Fix and Fit provides personalized, high-quality prosthetics, orthotics, and podorthotics solutions. Making you fit again with expert care and international quality products."
        />
        <meta name="keywords" content="prosthetics, orthotics, podorthotics, rehabilitation, medical devices, Fix and Fit" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout>
        <Hero />
        <Services />
        <FeaturedProducts />
        <AboutSection />
        <ContactSection />
      </Layout>
    </>
  )
}

export default HomePage
