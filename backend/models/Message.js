const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: false,
    },
    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      required: false,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message content cannot exceed 2000 characters'],
    },
    messageType: {
      type: String,
      enum: ['general', 'appointment', 'consultation', 'support', 'system'],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    attachments: [
      {
        filename: String,
        originalName: String,
        url: String,
        size: Number,
        mimeType: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    parentMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, createdAt: -1 });
messageSchema.index({ appointment: 1, createdAt: -1 });
messageSchema.index({ consultation: 1, createdAt: -1 });
messageSchema.index({ isRead: 1, recipient: 1 });
messageSchema.index({ messageType: 1, createdAt: -1 });

// Virtual for replies
messageSchema.virtual('replies', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'parentMessage',
  options: { sort: { createdAt: 1 } },
});

// Instance method to mark as read
messageSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Instance method to archive message
messageSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = function(user1Id, user2Id, options = {}) {
  const { limit = 50, skip = 0, includeArchived = false } = options;
  
  const query = {
    $or: [
      { sender: user1Id, recipient: user2Id },
      { sender: user2Id, recipient: user1Id },
    ],
    parentMessage: { $exists: false }, // Only get root messages, not replies
  };

  if (!includeArchived) {
    query.isArchived = false;
  }

  return this.find(query)
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
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get unread count for user
messageSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    isArchived: false,
  });
};

// Static method to get messages by type
messageSchema.statics.getMessagesByType = function(userId, messageType, options = {}) {
  const { limit = 20, skip = 0, includeArchived = false } = options;
  
  const query = {
    $or: [
      { sender: userId },
      { recipient: userId },
    ],
    messageType,
  };

  if (!includeArchived) {
    query.isArchived = false;
  }

  return this.find(query)
    .populate('sender', 'firstName lastName profileImage role')
    .populate('recipient', 'firstName lastName profileImage role')
    .populate('appointment', 'appointmentType startTime status')
    .populate('consultation', 'status startTime')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Pre-save middleware to set read status for system messages
messageSchema.pre('save', function(next) {
  if (this.messageType === 'system' && this.isNew) {
    // System messages are automatically marked as read after 24 hours
    setTimeout(() => {
      if (!this.isRead) {
        this.markAsRead();
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
  }
  next();
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
