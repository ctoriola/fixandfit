const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Article slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Article excerpt is required'],
      trim: true,
      maxlength: [500, 'Excerpt cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Article content is required'],
    },
    featuredImage: {
      url: String,
      alt: String,
      caption: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Article author is required'],
    },
    category: {
      type: String,
      required: [true, 'Article category is required'],
      enum: [
        'prosthetics',
        'orthotics',
        'rehabilitation',
        'mobility',
        'lifestyle',
        'technology',
        'research',
        'patient-stories',
        'general'
      ],
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: {
      type: Date,
    },
    readingTime: {
      type: Number, // in minutes
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      likedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      },
      isApproved: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      replies: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
          trim: true,
          maxlength: [500, 'Reply cannot exceed 500 characters'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }],
    }],
    seoTitle: {
      type: String,
      maxlength: [60, 'SEO title cannot exceed 60 characters'],
    },
    seoDescription: {
      type: String,
      maxlength: [160, 'SEO description cannot exceed 160 characters'],
    },
    relatedArticles: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
    }],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
articleSchema.index({ slug: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ author: 1 });
articleSchema.index({ isFeatured: 1, priority: -1 });
articleSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

// Virtual for like count
articleSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
articleSchema.virtual('commentCount').get(function() {
  return this.comments.filter(comment => comment.isApproved).length;
});

// Virtual for URL
articleSchema.virtual('url').get(function() {
  return `/education/${this.slug}`;
});

// Pre-save middleware to generate slug
articleSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }
  next();
});

// Pre-save middleware to calculate reading time
articleSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

// Pre-save middleware to set published date
articleSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Instance method to increment views
articleSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Instance method to add like
articleSchema.methods.addLike = function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  
  if (!existingLike) {
    this.likes.push({ user: userId });
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Instance method to remove like
articleSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  return this.save();
};

// Instance method to add comment
articleSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content,
    isApproved: false, // Require approval by default
  });
  return this.save();
};

// Instance method to approve comment
articleSchema.methods.approveComment = function(commentId) {
  const comment = this.comments.id(commentId);
  if (comment) {
    comment.isApproved = true;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to find published articles
articleSchema.statics.findPublished = function(options = {}) {
  const { category, tags, limit = 10, page = 1, featured = false } = options;
  
  const query = { status: 'published' };
  
  if (category) query.category = category;
  if (tags && tags.length > 0) query.tags = { $in: tags };
  if (featured) query.isFeatured = true;
  
  return this.find(query)
    .populate('author', 'firstName lastName profileImage')
    .sort(featured ? { priority: -1, publishedAt: -1 } : { publishedAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
};

// Static method to search articles
articleSchema.statics.search = function(searchTerm, options = {}) {
  const { category, limit = 10, page = 1 } = options;
  
  const query = {
    status: 'published',
    $text: { $search: searchTerm }
  };
  
  if (category) query.category = category;
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .populate('author', 'firstName lastName profileImage')
    .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit);
};

// Static method to get popular articles
articleSchema.statics.findPopular = function(limit = 5) {
  return this.find({ status: 'published' })
    .populate('author', 'firstName lastName profileImage')
    .sort({ views: -1, publishedAt: -1 })
    .limit(limit);
};

// Static method to get related articles
articleSchema.statics.findRelated = function(articleId, category, tags, limit = 3) {
  return this.find({
    _id: { $ne: articleId },
    status: 'published',
    $or: [
      { category: category },
      { tags: { $in: tags } }
    ]
  })
  .populate('author', 'firstName lastName profileImage')
  .sort({ publishedAt: -1 })
  .limit(limit);
};

module.exports = mongoose.model('Article', articleSchema);
