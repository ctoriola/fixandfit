import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { 
  ClockIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowLeftIcon,
  ShareIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Article {
  _id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featuredImage?: {
    url: string
    alt: string
    caption?: string
  }
  author: {
    _id: string
    firstName: string
    lastName: string
    profileImage?: string
  }
  category: string
  tags: string[]
  publishedAt: string
  readingTime: number
  views: number
  likes: Array<{ user: string }>
  comments: Array<{
    _id: string
    user: {
      firstName: string
      lastName: string
      profileImage?: string
    }
    content: string
    isApproved: boolean
    createdAt: string
  }>
  relatedArticles?: Article[]
  seoTitle?: string
  seoDescription?: string
}

const ArticlePage: NextPage = () => {
  const router = useRouter()
  const { slug } = router.query
  const { user } = useAuth()
  
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (slug) {
      fetchArticle()
    }
  }, [slug])

  useEffect(() => {
    if (article && user) {
      setIsLiked(article.likes.some(like => like.user === user._id))
    }
  }, [article, user])

  const fetchArticle = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/articles/${slug}`)
      setArticle(response.data.data.article)
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Article not found')
        router.push('/education')
      } else {
        toast.error('Failed to load article')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Please log in to like articles')
      return
    }

    try {
      if (isLiked) {
        await axios.patch(`/api/articles/${article?._id}/unlike`)
        setIsLiked(false)
        if (article) {
          setArticle({
            ...article,
            likes: article.likes.filter(like => like.user !== user._id)
          })
        }
      } else {
        await axios.patch(`/api/articles/${article?._id}/like`)
        setIsLiked(true)
        if (article) {
          setArticle({
            ...article,
            likes: [...article.likes, { user: user._id }]
          })
        }
      }
    } catch (error) {
      toast.error('Failed to update like')
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please log in to comment')
      return
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    try {
      setSubmittingComment(true)
      const response = await axios.post(`/api/articles/${article?._id}/comments`, {
        content: newComment
      })
      
      setArticle(response.data.data.article)
      setNewComment('')
      toast.success('Comment submitted for approval')
    } catch (error) {
      toast.error('Failed to submit comment')
    } finally {
      setSubmittingComment(false)
    }
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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (!article) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-secondary-900 mb-4">Article Not Found</h1>
            <Link href="/education" className="btn-primary">
              Back to Education Hub
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const approvedComments = article.comments.filter(comment => comment.isApproved)

  return (
    <>
      <Head>
        <title>{article.seoTitle || article.title} - Fix and Fit</title>
        <meta name="description" content={article.seoDescription || article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        {article.featuredImage && (
          <meta property="og:image" content={article.featuredImage.url} />
        )}
      </Head>

      <Layout>
        <div className="py-8 bg-secondary-50 min-h-screen">
          <div className="container-max section-padding">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <Link
                href="/education"
                className="inline-flex items-center text-primary-600 hover:text-primary-700 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Education Hub
              </Link>
            </motion.div>

            <div className="grid lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="card"
                >
                  {/* Article Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(article.category)}`}>
                        {article.category.replace('-', ' ')}
                      </span>
                      {article.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-secondary-100 text-secondary-600 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <h1 className="text-3xl lg:text-4xl font-heading font-bold text-secondary-900 mb-4">
                      {article.title}
                    </h1>

                    <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          {article.author.profileImage ? (
                            <img
                              src={article.author.profileImage}
                              alt={`${article.author.firstName} ${article.author.lastName}`}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                              <UserIcon className="w-5 h-5 text-primary-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-secondary-900">
                              {article.author.firstName} {article.author.lastName}
                            </p>
                            <div className="flex items-center text-sm text-secondary-500">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {formatDate(article.publishedAt)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-secondary-500">
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {article.readingTime} min read
                        </div>
                        <div className="flex items-center">
                          <EyeIcon className="w-4 h-4 mr-1" />
                          {article.views} views
                        </div>
                      </div>
                    </div>

                    {/* Featured Image */}
                    {article.featuredImage && (
                      <div className="mb-6">
                        <img
                          src={article.featuredImage.url}
                          alt={article.featuredImage.alt || article.title}
                          className="w-full rounded-lg"
                        />
                        {article.featuredImage.caption && (
                          <p className="text-sm text-secondary-500 mt-2 text-center italic">
                            {article.featuredImage.caption}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Article Content */}
                  <div 
                    className="prose prose-lg max-w-none mb-8"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />

                  {/* Article Actions */}
                  <div className="border-t border-secondary-200 pt-6 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handleLike}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                            isLiked
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                          }`}
                        >
                          {isLiked ? (
                            <HeartSolidIcon className="w-5 h-5" />
                          ) : (
                            <HeartIcon className="w-5 h-5" />
                          )}
                          <span>{article.likes.length}</span>
                        </button>

                        <button
                          onClick={() => setShowComments(!showComments)}
                          className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
                        >
                          <ChatBubbleLeftIcon className="w-5 h-5" />
                          <span>{approvedComments.length}</span>
                        </button>
                      </div>

                      <button className="flex items-center space-x-2 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors">
                        <ShareIcon className="w-5 h-5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {showComments && (
                    <div className="border-t border-secondary-200 pt-6">
                      <h3 className="text-xl font-semibold text-secondary-900 mb-6">
                        Comments ({approvedComments.length})
                      </h3>

                      {/* Comment Form */}
                      {user ? (
                        <form onSubmit={handleComment} className="mb-8">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts..."
                            rows={4}
                            className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
                          />
                          <button
                            type="submit"
                            disabled={submittingComment}
                            className="btn-primary"
                          >
                            {submittingComment ? 'Submitting...' : 'Submit Comment'}
                          </button>
                        </form>
                      ) : (
                        <div className="bg-secondary-100 rounded-lg p-4 mb-8 text-center">
                          <p className="text-secondary-600 mb-3">
                            Please log in to leave a comment
                          </p>
                          <Link href="/login" className="btn-primary">
                            Log In
                          </Link>
                        </div>
                      )}

                      {/* Comments List */}
                      <div className="space-y-6">
                        {approvedComments.map((comment) => (
                          <div key={comment._id} className="flex space-x-4">
                            {comment.user.profileImage ? (
                              <img
                                src={comment.user.profileImage}
                                alt={`${comment.user.firstName} ${comment.user.lastName}`}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-primary-600" />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <div className="bg-secondary-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-secondary-900">
                                    {comment.user.firstName} {comment.user.lastName}
                                  </h4>
                                  <span className="text-sm text-secondary-500">
                                    {formatDate(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-secondary-700">{comment.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {approvedComments.length === 0 && (
                          <p className="text-center text-secondary-500 py-8">
                            No comments yet. Be the first to share your thoughts!
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.article>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Related Articles */}
                {article.relatedArticles && article.relatedArticles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="card mb-8"
                  >
                    <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                      Related Articles
                    </h3>
                    
                    <div className="space-y-4">
                      {article.relatedArticles.map((relatedArticle) => (
                        <Link key={relatedArticle._id} href={`/education/${relatedArticle.slug}`}>
                          <div className="flex space-x-3 hover:bg-secondary-50 p-2 rounded-lg transition-colors cursor-pointer">
                            {relatedArticle.featuredImage && (
                              <div className="w-16 h-16 bg-secondary-200 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={relatedArticle.featuredImage.url}
                                  alt={relatedArticle.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-secondary-900 line-clamp-2 mb-1">
                                {relatedArticle.title}
                              </h4>
                              <div className="flex items-center text-xs text-secondary-500 space-x-2">
                                <span className={`px-1 py-0.5 rounded text-xs ${getCategoryColor(relatedArticle.category)}`}>
                                  {relatedArticle.category.replace('-', ' ')}
                                </span>
                                <div className="flex items-center">
                                  <ClockIcon className="w-3 h-3 mr-1" />
                                  {relatedArticle.readingTime} min
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Share Widget */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="card"
                >
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                    Share This Article
                  </h3>
                  
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Share on Facebook
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors">
                      Share on Twitter
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors">
                      Share on LinkedIn
                    </button>
                    <button className="w-full text-left px-3 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors">
                      Copy Link
                    </button>
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

export default ArticlePage
