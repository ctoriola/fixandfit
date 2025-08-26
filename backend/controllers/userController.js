const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Get all users (admin only)
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-password');
  
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

// Get current user profile
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Update current user profile
exports.updateMe = catchAsync(async (req, res, next) => {
  // Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError('This route is not for password updates. Please use /updatePassword.', 400)
    );
  }

  // Filter out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email', 'phone', 'address');

  // Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Create admin user (super admin only)
exports.createAdmin = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already in use', 400));
  }

  // Create admin user
  const newAdmin = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    role: 'admin',
  });

  // Remove password from output
  newAdmin.password = undefined;

  res.status(201).json({
    status: 'success',
    data: {
      user: newAdmin,
    },
  });
});

// Update user role (admin only)
exports.updateUserRole = catchAsync(async (req, res, next) => {
  const { role } = req.body;
  
  if (!['user', 'staff', 'admin'].includes(role)) {
    return next(new AppError('Invalid role specified', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Delete user (admin only)
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Get user statistics (admin only)
exports.getUserStats = catchAsync(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isActive: true });
  const recentUsers = await User.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });

  res.status(200).json({
    status: 'success',
    data: {
      roleStats: stats,
      totalUsers,
      activeUsers,
      recentUsers,
    },
  });
});

// Helper function to filter object
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
