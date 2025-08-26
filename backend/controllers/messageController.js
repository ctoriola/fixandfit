const Message = require('../models/Message');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Get all messages for a user (inbox)
exports.getMyMessages = catchAsync(async (req, res, next) => {
  const { type, page = 1, limit = 20, unreadOnly = false } = req.query;
  const skip = (page - 1) * limit;

  let query = {
    recipient: req.user.id,
    isArchived: false,
  };

  if (type) {
    query.messageType = type;
  }

  if (unreadOnly === 'true') {
    query.isRead = false;
  }

  const messages = await Message.find(query)
    .populate('sender', 'firstName lastName profileImage role')
    .populate('appointment', 'appointmentType startTime status')
    .populate('consultation', 'status startTime')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const totalMessages = await Message.countDocuments(query);
  const unreadCount = await Message.getUnreadCount(req.user.id);

  res.status(200).json({
    status: 'success',
    results: messages.length,
    totalMessages,
    unreadCount,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalMessages / limit),
    data: {
      messages,
    },
  });
});

// Get sent messages
exports.getSentMessages = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const messages = await Message.find({
    sender: req.user.id,
    isArchived: false,
  })
    .populate('recipient', 'firstName lastName profileImage role')
    .populate('appointment', 'appointmentType startTime status')
    .populate('consultation', 'status startTime')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const totalMessages = await Message.countDocuments({
    sender: req.user.id,
    isArchived: false,
  });

  res.status(200).json({
    status: 'success',
    results: messages.length,
    totalMessages,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalMessages / limit),
    data: {
      messages,
    },
  });
});

// Get conversation between user and admin
exports.getConversation = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const skip = (page - 1) * limit;

  // Verify the other user exists
  const otherUser = await User.findById(userId);
  if (!otherUser) {
    return next(new AppError('User not found', 404));
  }

  // Only allow conversations between users and admins/staff
  if (req.user.role === 'user' && !['admin', 'staff'].includes(otherUser.role)) {
    return next(new AppError('You can only message admins or staff', 403));
  }

  const messages = await Message.getConversation(req.user.id, userId, {
    limit: parseInt(limit),
    skip,
  });

  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: {
      messages,
      otherUser: {
        _id: otherUser._id,
        firstName: otherUser.firstName,
        lastName: otherUser.lastName,
        profileImage: otherUser.profileImage,
        role: otherUser.role,
      },
    },
  });
});

// Send a new message
exports.sendMessage = catchAsync(async (req, res, next) => {
  const {
    recipientId,
    subject,
    content,
    messageType = 'general',
    priority = 'normal',
    appointmentId,
    consultationId,
    parentMessageId,
  } = req.body;

  // Verify recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return next(new AppError('Recipient not found', 404));
  }

  // Only allow messaging between users and admins/staff
  if (req.user.role === 'user' && !['admin', 'staff'].includes(recipient.role)) {
    return next(new AppError('You can only message admins or staff', 403));
  }

  const messageData = {
    sender: req.user.id,
    recipient: recipientId,
    subject,
    content,
    messageType,
    priority,
  };

  if (appointmentId) messageData.appointment = appointmentId;
  if (consultationId) messageData.consultation = consultationId;
  if (parentMessageId) messageData.parentMessage = parentMessageId;

  const message = await Message.create(messageData);
  
  await message.populate([
    { path: 'sender', select: 'firstName lastName profileImage role' },
    { path: 'recipient', select: 'firstName lastName profileImage role' },
    { path: 'appointment', select: 'appointmentType startTime status' },
    { path: 'consultation', select: 'status startTime' },
  ]);

  res.status(201).json({
    status: 'success',
    data: {
      message,
    },
  });
});

// Mark message as read
exports.markAsRead = catchAsync(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  // Only recipient can mark message as read
  if (message.recipient.toString() !== req.user.id) {
    return next(new AppError('You can only mark your own messages as read', 403));
  }

  await message.markAsRead();

  res.status(200).json({
    status: 'success',
    data: {
      message,
    },
  });
});

// Mark multiple messages as read
exports.markMultipleAsRead = catchAsync(async (req, res, next) => {
  const { messageIds } = req.body;

  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    return next(new AppError('Please provide an array of message IDs', 400));
  }

  const result = await Message.updateMany(
    {
      _id: { $in: messageIds },
      recipient: req.user.id,
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      modifiedCount: result.modifiedCount,
    },
  });
});

// Archive message
exports.archiveMessage = catchAsync(async (req, res, next) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  // Only sender or recipient can archive message
  if (
    message.sender.toString() !== req.user.id &&
    message.recipient.toString() !== req.user.id
  ) {
    return next(new AppError('You can only archive your own messages', 403));
  }

  await message.archive();

  res.status(200).json({
    status: 'success',
    data: {
      message,
    },
  });
});

// Get message by ID
exports.getMessage = catchAsync(async (req, res, next) => {
  const message = await Message.findById(req.params.id)
    .populate('sender', 'firstName lastName profileImage role')
    .populate('recipient', 'firstName lastName profileImage role')
    .populate('appointment', 'appointmentType startTime status')
    .populate('consultation', 'status startTime')
    .populate({
      path: 'replies',
      populate: {
        path: 'sender recipient',
        select: 'firstName lastName profileImage role',
      },
    });

  if (!message) {
    return next(new AppError('Message not found', 404));
  }

  // Check if user has access to this message
  if (
    message.sender._id.toString() !== req.user.id &&
    message.recipient._id.toString() !== req.user.id
  ) {
    return next(new AppError('You do not have access to this message', 403));
  }

  // Mark as read if user is the recipient
  if (message.recipient._id.toString() === req.user.id && !message.isRead) {
    await message.markAsRead();
  }

  res.status(200).json({
    status: 'success',
    data: {
      message,
    },
  });
});

// Get available recipients (admins/staff for users, all users for admins/staff)
exports.getAvailableRecipients = catchAsync(async (req, res, next) => {
  let query = {};

  if (req.user.role === 'user') {
    // Users can only message admins and staff
    query.role = { $in: ['admin', 'staff'] };
  } else {
    // Admins and staff can message anyone
    query._id = { $ne: req.user.id }; // Exclude self
  }

  query.isActive = true;

  const recipients = await User.find(query)
    .select('firstName lastName email role profileImage')
    .sort({ role: 1, firstName: 1 });

  res.status(200).json({
    status: 'success',
    results: recipients.length,
    data: {
      recipients,
    },
  });
});

// Admin: Get all messages (for moderation)
exports.getAllMessages = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 50, messageType, priority } = req.query;
  const skip = (page - 1) * limit;

  let query = {};

  if (messageType) query.messageType = messageType;
  if (priority) query.priority = priority;

  const messages = await Message.find(query)
    .populate('sender', 'firstName lastName email role')
    .populate('recipient', 'firstName lastName email role')
    .populate('appointment', 'appointmentType startTime status')
    .populate('consultation', 'status startTime')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip);

  const totalMessages = await Message.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: messages.length,
    totalMessages,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalMessages / limit),
    data: {
      messages,
    },
  });
});

// Admin: Get messaging statistics
exports.getMessageStats = catchAsync(async (req, res, next) => {
  const stats = await Message.aggregate([
    {
      $group: {
        _id: '$messageType',
        count: { $sum: 1 },
        unreadCount: {
          $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] },
        },
      },
    },
  ]);

  const totalMessages = await Message.countDocuments();
  const totalUnread = await Message.countDocuments({ isRead: false });

  res.status(200).json({
    status: 'success',
    data: {
      totalMessages,
      totalUnread,
      messagesByType: stats,
    },
  });
});
