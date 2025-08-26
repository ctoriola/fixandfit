const Article = require('../models/Article');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Get all published articles
exports.getArticles = catchAsync(async (req, res, next) => {
  const { 
    category, 
    tags, 
    search, 
    featured, 
    limit = 10, 
    page = 1,
    sort = 'newest'
  } = req.query;

  let articles;
  let total;

  if (search) {
    articles = await Article.search(search, { category, limit: limit * 1, page: page * 1 });
    total = await Article.countDocuments({
      status: 'published',
      $text: { $search: search },
      ...(category && { category })
    });
  } else {
    const options = {
      category,
      tags: tags ? tags.split(',') : undefined,
      limit: limit * 1,
      page: page * 1,
      featured: featured === 'true'
    };

    articles = await Article.findPublished(options);
    
    const query = { status: 'published' };
    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(',') };
    if (featured === 'true') query.isFeatured = true;
    
    total = await Article.countDocuments(query);
  }

  res.status(200).json({
    status: 'success',
    results: articles.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page * 1,
    data: {
      articles,
    },
  });
});

// Get single article by slug
exports.getArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findOne({ 
    slug: req.params.slug, 
    status: 'published' 
  })
  .populate('author', 'firstName lastName profileImage')
  .populate('comments.user', 'firstName lastName profileImage')
  .populate('relatedArticles', 'title slug excerpt featuredImage category publishedAt readingTime');

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  // Increment views
  await article.incrementViews();

  // Get related articles if not manually set
  if (!article.relatedArticles || article.relatedArticles.length === 0) {
    const relatedArticles = await Article.findRelated(
      article._id, 
      article.category, 
      article.tags, 
      3
    );
    article.relatedArticles = relatedArticles;
  }

  res.status(200).json({
    status: 'success',
    data: {
      article,
    },
  });
});

// Get popular articles
exports.getPopularArticles = catchAsync(async (req, res, next) => {
  const { limit = 5 } = req.query;
  
  const articles = await Article.findPopular(limit * 1);

  res.status(200).json({
    status: 'success',
    results: articles.length,
    data: {
      articles,
    },
  });
});

// Get featured articles
exports.getFeaturedArticles = catchAsync(async (req, res, next) => {
  const { limit = 3 } = req.query;
  
  const articles = await Article.findPublished({ 
    featured: true, 
    limit: limit * 1 
  });

  res.status(200).json({
    status: 'success',
    results: articles.length,
    data: {
      articles,
    },
  });
});

// Get article categories
exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = await Article.aggregate([
    { $match: { status: 'published' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  const categoryList = [
    { value: 'prosthetics', label: 'Prosthetics', count: 0 },
    { value: 'orthotics', label: 'Orthotics', count: 0 },
    { value: 'rehabilitation', label: 'Rehabilitation', count: 0 },
    { value: 'mobility', label: 'Mobility', count: 0 },
    { value: 'lifestyle', label: 'Lifestyle', count: 0 },
    { value: 'technology', label: 'Technology', count: 0 },
    { value: 'research', label: 'Research', count: 0 },
    { value: 'patient-stories', label: 'Patient Stories', count: 0 },
    { value: 'general', label: 'General', count: 0 }
  ];

  categories.forEach(cat => {
    const category = categoryList.find(c => c.value === cat._id);
    if (category) category.count = cat.count;
  });

  res.status(200).json({
    status: 'success',
    data: {
      categories: categoryList,
    },
  });
});

// Like article
exports.likeArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  await article.addLike(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      article,
    },
  });
});

// Unlike article
exports.unlikeArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  await article.removeLike(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      article,
    },
  });
});

// Add comment to article
exports.addComment = catchAsync(async (req, res, next) => {
  const { content } = req.body;
  
  if (!content || content.trim().length === 0) {
    return next(new AppError('Comment content is required', 400));
  }

  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  await article.addComment(req.user.id, content);
  await article.populate('comments.user', 'firstName lastName profileImage');

  res.status(201).json({
    status: 'success',
    data: {
      article,
    },
  });
});

// ADMIN ROUTES

// Get all articles (including drafts) - Admin only
exports.getAllArticles = catchAsync(async (req, res, next) => {
  const { 
    status, 
    category, 
    author, 
    limit = 20, 
    page = 1,
    sort = 'newest'
  } = req.query;

  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (author) query.author = author;

  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    published: { publishedAt: -1 },
    popular: { views: -1 },
    title: { title: 1 }
  };

  const articles = await Article.find(query)
    .populate('author', 'firstName lastName profileImage')
    .sort(sortOptions[sort] || sortOptions.newest)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Article.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: articles.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page * 1,
    data: {
      articles,
    },
  });
});

// Create article - Admin/Staff only
exports.createArticle = catchAsync(async (req, res, next) => {
  const articleData = {
    ...req.body,
    author: req.user.id,
  };

  const article = await Article.create(articleData);
  await article.populate('author', 'firstName lastName profileImage');

  res.status(201).json({
    status: 'success',
    data: {
      article,
    },
  });
});

// Update article - Admin/Staff only
exports.updateArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  // Check if user can edit this article
  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only edit your own articles', 403));
  }

  const updatedArticle = await Article.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('author', 'firstName lastName profileImage');

  res.status(200).json({
    status: 'success',
    data: {
      article: updatedArticle,
    },
  });
});

// Delete article - Admin only
exports.deleteArticle = catchAsync(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  await Article.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Approve comment - Admin/Staff only
exports.approveComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  
  const article = await Article.findById(req.params.id);

  if (!article) {
    return next(new AppError('Article not found', 404));
  }

  await article.approveComment(commentId);
  await article.populate('comments.user', 'firstName lastName profileImage');

  res.status(200).json({
    status: 'success',
    data: {
      article,
    },
  });
});

// Get article statistics - Admin only
exports.getArticleStats = catchAsync(async (req, res, next) => {
  const stats = await Article.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalViews: { $sum: '$views' },
        avgViews: { $avg: '$views' },
      },
    },
  ]);

  const categoryStats = await Article.aggregate([
    { $match: { status: 'published' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalViews: { $sum: '$views' },
      },
    },
    { $sort: { count: -1 } }
  ]);

  const totalArticles = await Article.countDocuments();
  const publishedArticles = await Article.countDocuments({ status: 'published' });
  const draftArticles = await Article.countDocuments({ status: 'draft' });
  const totalViews = await Article.aggregate([
    { $group: { _id: null, total: { $sum: '$views' } } }
  ]);

  const recentArticles = await Article.find({ status: 'published' })
    .populate('author', 'firstName lastName')
    .sort({ publishedAt: -1 })
    .limit(5);

  res.status(200).json({
    status: 'success',
    data: {
      statusStats: stats,
      categoryStats,
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews: totalViews[0]?.total || 0,
      recentArticles,
    },
  });
});
