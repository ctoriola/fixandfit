const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Get all products with filtering, sorting, and pagination
exports.getAllProducts = catchAsync(async (req, res, next) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
  excludedFields.forEach(el => delete queryObj[el]);

  // Advanced filtering
  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

  let query = Product.find(JSON.parse(queryStr));

  // Search functionality
  if (req.query.search) {
    query = query.find({
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ]
    });
  }

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // Pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Execute query
  const products = await query;
  const total = await Product.countDocuments(JSON.parse(queryStr));

  res.status(200).json({
    status: 'success',
    results: products.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      products,
    },
  });
});

// Get featured products
exports.getFeaturedProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({ isFeatured: true })
    .select('name slug description price images category subcategory rating')
    .limit(8);

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

// Get single product
exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    return next(new AppError('No product found with that slug', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

// Create new product (admin only)
exports.createProduct = catchAsync(async (req, res, next) => {
  // Generate slug from name
  const slug = req.body.name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, '-');

  const newProduct = await Product.create({
    ...req.body,
    slug,
  });

  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct,
    },
  });
});

// Update product (admin only)
exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

// Delete product (admin only)
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Get products by category
exports.getProductsByCategory = catchAsync(async (req, res, next) => {
  const { category } = req.params;
  
  const products = await Product.find({ category })
    .select('name slug description price images subcategory rating')
    .sort('-rating');

  res.status(200).json({
    status: 'success',
    results: products.length,
    data: {
      products,
    },
  });
});

// Get product categories and subcategories
exports.getCategories = catchAsync(async (req, res, next) => {
  const categories = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        subcategories: { $addToSet: '$subcategory' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      categories,
    },
  });
});
