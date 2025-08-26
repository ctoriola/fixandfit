const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Consultation must be linked to an appointment'],
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
    },
    practitioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Practitioner is required'],
    },
    roomId: {
      type: String,
      required: [true, 'Room ID is required'],
      unique: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
    },
    actualStartTime: {
      type: Date,
    },
    actualEndTime: {
      type: Date,
    },
    duration: {
      type: Number, // in minutes
    },
    notes: {
      type: String,
      trim: true,
    },
    patientNotes: {
      type: String,
      trim: true,
    },
    practitionerNotes: {
      type: String,
      trim: true,
    },
    recordings: [{
      filename: String,
      url: String,
      duration: Number,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    attachments: [{
      filename: String,
      originalName: String,
      url: String,
      fileType: String,
      fileSize: Number,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      role: {
        type: String,
        enum: ['patient', 'admin', 'observer'],
        required: true,
      },
      joinedAt: Date,
      leftAt: Date,
      connectionStatus: {
        type: String,
        enum: ['connected', 'disconnected', 'reconnecting'],
        default: 'disconnected',
      },
    }],
    technicalIssues: [{
      issue: String,
      reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      reportedAt: {
        type: Date,
        default: Date.now,
      },
      resolved: {
        type: Boolean,
        default: false,
      },
    }],
    feedback: {
      patientRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      patientFeedback: String,
      practitionerRating: {
        type: Number,
        min: 1,
        max: 5,
      },
      practitionerFeedback: String,
      technicalRating: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpNotes: String,
    nextAppointmentSuggested: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
consultationSchema.index({ appointment: 1 });
consultationSchema.index({ patient: 1 });
consultationSchema.index({ practitioner: 1 });
consultationSchema.index({ roomId: 1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ startTime: 1 });

// Virtual for consultation duration
consultationSchema.virtual('calculatedDuration').get(function() {
  if (this.actualStartTime && this.actualEndTime) {
    return Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60)); // in minutes
  }
  return null;
});

// Pre-save middleware to generate room ID
consultationSchema.pre('save', function(next) {
  if (!this.roomId) {
    this.roomId = `consultation_${this._id}_${Date.now()}`;
  }
  next();
});

// Pre-save middleware to calculate duration
consultationSchema.pre('save', function(next) {
  if (this.actualStartTime && this.actualEndTime && !this.duration) {
    this.duration = Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60));
  }
  next();
});

// Instance method to start consultation
consultationSchema.methods.startConsultation = function() {
  this.status = 'active';
  this.actualStartTime = new Date();
  return this.save();
};

// Instance method to end consultation
consultationSchema.methods.endConsultation = function(notes) {
  this.status = 'completed';
  this.actualEndTime = new Date();
  if (notes) {
    this.notes = notes;
  }
  this.duration = Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60));
  return this.save();
};

// Instance method to add participant
consultationSchema.methods.addParticipant = function(userId) {
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  
  if (existingParticipant) {
    existingParticipant.joinedAt = new Date();
    existingParticipant.leftAt = undefined;
  } else {
    this.participants.push({
      user: userId,
      joinedAt: new Date(),
    });
  }
  
  return this.save();
};

// Instance method to remove participant
consultationSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  
  if (participant) {
    participant.leftAt = new Date();
  }
  
  return this.save();
};

// Static method to find active consultations for user
consultationSchema.statics.findActiveForUser = function(userId) {
  return this.find({
    $or: [
      { patient: userId },
      { practitioner: userId }
    ],
    status: 'active'
  }).populate('patient practitioner appointment');
};

// Static method to find upcoming consultations
consultationSchema.statics.findUpcoming = function(userId, limit = 10) {
  return this.find({
    $or: [
      { patient: userId },
      { practitioner: userId }
    ],
    status: 'scheduled',
    startTime: { $gte: new Date() }
  })
  .sort({ startTime: 1 })
  .limit(limit)
  .populate('patient practitioner appointment');
};

module.exports = mongoose.model('Consultation', consultationSchema);
