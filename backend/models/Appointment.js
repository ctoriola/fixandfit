const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Admin is required'],
    },
    appointmentType: {
      type: String,
      required: [true, 'Appointment type is required'],
      enum: [
        'consultation',
        'fitting',
        'follow-up',
        'adjustment',
        'emergency',
        'virtual-consultation',
      ],
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show', 'in-progress'],
      default: 'scheduled',
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: 'End time must be after start time',
      },
    },
    notes: String,
    reason: {
      type: String,
      required: [true, 'Reason for appointment is required'],
    },
    documents: [
      {
        name: String,
        url: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isVirtual: {
      type: Boolean,
      default: false,
    },
    meetingLink: String,
    reminders: [
      {
        sentAt: Date,
        method: {
          type: String,
          enum: ['email', 'sms', 'push'],
        },
        status: {
          type: String,
          enum: ['pending', 'sent', 'failed'],
        },
      },
    ],
    cancelledAt: Date,
    cancellationReason: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
appointmentSchema.index({ patient: 1, startTime: 1 });
appointmentSchema.index({ admin: 1, startTime: 1 });
appointmentSchema.index({ status: 1, startTime: 1 });
appointmentSchema.index({ startTime: 1, endTime: 1 });

// Virtual for appointment duration in minutes
appointmentSchema.virtual('duration').get(function () {
  return (this.endTime - this.startTime) / (1000 * 60);
});

// Middleware to validate appointment time slot
appointmentSchema.pre('save', async function (next) {
  // Skip validation for cancelled appointments
  if (this.status === 'cancelled') return next();

  const existingAppointment = await this.constructor.findOne({
    $or: [
      // Check for overlapping appointments for the admin
      {
        admin: this.admin,
        _id: { $ne: this._id },
        status: { $ne: 'cancelled' },
        $or: [
          { startTime: { $lt: this.endTime }, endTime: { $gt: this.startTime } },
        ],
      },
      // Check for overlapping appointments for the patient
      {
        patient: this.patient,
        _id: { $ne: this._id },
        status: { $ne: 'cancelled' },
        $or: [
          { startTime: { $lt: this.endTime }, endTime: { $gt: this.startTime } },
        ],
      },
    ],
  });

  if (existingAppointment) {
    const error = new Error('Time slot is already booked');
    error.statusCode = 400;
    return next(error);
  }

  next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
