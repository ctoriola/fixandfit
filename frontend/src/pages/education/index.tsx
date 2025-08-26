import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { motion } from 'framer-motion'
import { 
  MagnifyingGlassIcon, 
  ClockIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  FunnelIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Article {
  _id: string
  title: string
  slug: string
  excerpt: string
  featuredImage?: {
    url: string
    alt: string
  }
  author: {
    firstName: string
    lastName: string
    profileImage?: string
  }
  category: string
  tags: string[]
  publishedAt: string
  readingTime: number
  views: number
  likeCount: number
  commentCount: number
  likes: Array<{ user: string }>
}

interface Category {
  value: string
  label: string
  count: number
}

const EducationHub: NextPage = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([])
  const [popularArticles, setPopularArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [selectedCategory, currentPage])

  const fetchInitialData = async () => {
    try {
      const [featuredRes, popularRes, categoriesRes] = await Promise.all([
        axios.get('/api/articles/featured'),
        axios.get('/api/articles/popular'),
        axios.get('/api/articles/categories')
      ])

      setFeaturedArticles(featuredRes.data.data.articles)
      setPopularArticles(popularRes.data.data.articles)
      setCategories(categoriesRes.data.data.categories)
    } catch (error) {
      toast.error('Failed to load educational content')
    }
  }

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '9'
      })

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await axios.get(`/api/articles?${params}`)
      setArticles(response.data.data.articles)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      toast.error('Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchArticles()
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      prosthetics: 'bg-blue-100 text-blue-800',
      orthotics: 'bg-green-100 text-green-800',
      rehabilitation: 'bg-purple-100 text-purple-800',
      mobility: 'bg-yellow-100 text-yellow-800',
      lifestyle: 'bg-pink-100 text-pink-800',
      technology: 'bg-indigo-100 text-indigo-800',
      research: 'bg-red-100 text-red-800',
      'patient-stories': 'bg-orange-100 text-orange-800',
      general: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors.general
  }

  return (
    <>
      <Head>
        <title>Educational Hub - Fix and Fit</title>
        <meta name="description" content="Learn about prosthetics, orthotics, rehabilitation, and mobility solutions." />
      </Head>

      <Layout>
        <div className="py-8 bg-secondary-50 min-h-screen">
          <div className="container-max section-padding">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl font-heading font-bold text-secondary-900 mb-4">
                Educational Hub
              </h1>
              <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
                Discover comprehensive resources about prosthetics, orthotics, rehabilitation, 
                and mobility solutions to help you on your journey.
              </p>
            </motion.div>

            {/* Featured Articles */}
            {featuredArticles.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-heading font-bold text-secondary-900 mb-6">
                  Featured Articles
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredArticles.map((article) => (
                    <Link key={article._id} href={`/education/${article.slug}`}>
                      <div className="card hover:shadow-soft transition-shadow cursor-pointer h-full">
                        {article.featuredImage && (
                          <div className="aspect-video bg-secondary-200 rounded-lg mb-4 overflow-hidden">
                            <img
                              src={article.featuredImage.url}
                              alt={article.featuredImage.alt || article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                            {article.category.replace('-', ' ')}
                          </span>
                          <span className="text-xs text-secondary-500">Featured</span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-secondary-900 mb-2 line-clamp-2">
                          {article.title}
                        </h3>
                        
                        <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-secondary-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              {article.readingTime} min read
                            </div>
                            <div className="flex items-center">
                              <EyeIcon className="w-4 h-4 mr-1" />
                              {article.views}
                            </div>
                          </div>
                          <span>{formatDate(article.publishedAt)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                {/* Search and Filters */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="card mb-8"
                >
                  <form onSubmit={handleSearch} className="flex gap-4 mb-4">
                    <div className="flex-1 relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                      <input
                        type="text"
                        placeholder="Search articles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button type="submit" className="btn-primary">
                      Search
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCategoryChange('all')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-primary-600 text-white'
                          : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => handleCategoryChange(category.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedCategory === category.value
                            ? 'bg-primary-600 text-white'
                            : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                        }`}
                      >
                        {category.label} ({category.count})
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Articles Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    </div>
                  ) : articles.length > 0 ? (
                    <>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {articles.map((article) => (
                          <Link key={article._id} href={`/education/${article.slug}`}>
                            <div className="card hover:shadow-soft transition-shadow cursor-pointer h-full">
                              {article.featuredImage && (
                                <div className="aspect-video bg-secondary-200 rounded-lg mb-4 overflow-hidden">
                                  <img
                                    src={article.featuredImage.url}
                                    alt={article.featuredImage.alt || article.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              
                              <div className="mb-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                                  {article.category.replace('-', ' ')}
                                </span>
                              </div>
                              
                              <h3 className="text-lg font-semibold text-secondary-900 mb-2 line-clamp-2">
                                {article.title}
                              </h3>
                              
                              <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
                                {article.excerpt}
                              </p>
                              
                              <div className="flex items-center justify-between text-xs text-secondary-500 mb-3">
                                <span>By {article.author.firstName} {article.author.lastName}</span>
                                <span>{formatDate(article.publishedAt)}</span>
                              </div>
                              
                              <div className="flex items-center justify-between text-xs text-secondary-500">
                                <div className="flex items-center space-x-3">
                                  <div className="flex items-center">
                                    <ClockIcon className="w-4 h-4 mr-1" />
                                    {article.readingTime} min
                                  </div>
                                  <div className="flex items-center">
                                    <EyeIcon className="w-4 h-4 mr-1" />
                                    {article.views}
                                  </div>
                                  <div className="flex items-center">
                                    <HeartIcon className="w-4 h-4 mr-1" />
                                    {article.likeCount}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 border border-secondary-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-50"
                          >
                            Previous
                          </button>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-2 border rounded-md ${
                                currentPage === page
                                  ? 'bg-primary-600 text-white border-primary-600'
                                  : 'border-secondary-300 hover:bg-secondary-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 border border-secondary-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary-50"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpenIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                        No articles found
                      </h3>
                      <p className="text-secondary-600">
                        {searchTerm || selectedCategory !== 'all'
                          ? 'Try adjusting your search or filter criteria.'
                          : 'Check back soon for new educational content.'}
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Popular Articles */}
                {popularArticles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="card mb-8"
                  >
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                      Popular Articles
                    </h3>
                    
                    <div className="space-y-4">
                      {popularArticles.map((article) => (
                        <Link key={article._id} href={`/education/${article.slug}`}>
                          <div className="flex space-x-3 hover:bg-secondary-50 p-2 rounded-lg transition-colors cursor-pointer">
                            {article.featuredImage && (
                              <div className="w-16 h-16 bg-secondary-200 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={article.featuredImage.url}
                                  alt={article.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-secondary-900 line-clamp-2 mb-1">
                                {article.title}
                              </h4>
                              <div className="flex items-center text-xs text-secondary-500 space-x-2">
                                <div className="flex items-center">
                                  <EyeIcon className="w-3 h-3 mr-1" />
                                  {article.views}
                                </div>
                                <div className="flex items-center">
                                  <ClockIcon className="w-3 h-3 mr-1" />
                                  {article.readingTime} min
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Categories */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="card"
                >
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                    Categories
                  </h3>
                  
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => handleCategoryChange(category.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category.value
                            ? 'bg-primary-100 text-primary-800'
                            : 'hover:bg-secondary-50 text-secondary-700'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{category.label}</span>
                          <span className="text-xs text-secondary-500">
                            {category.count}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}

export default EducationHub
