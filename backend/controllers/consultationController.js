const Consultation = require('../models/Consultation');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Create consultation from appointment
exports.createConsultation = catchAsync(async (req, res, next) => {
  const { appointmentId } = req.params;
  
  // Find the appointment
  const appointment = await Appointment.findById(appointmentId).populate('user practitioner');
  
  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }

  // Check if user is authorized (patient or practitioner)
  if (appointment.user._id.toString() !== req.user.id && 
      appointment.practitioner._id.toString() !== req.user.id &&
      req.user.role !== 'admin') {
    return next(new AppError('Not authorized to create consultation for this appointment', 403));
  }

  // Check if consultation already exists
  const existingConsultation = await Consultation.findOne({ appointment: appointmentId });
  if (existingConsultation) {
    return res.status(200).json({
      status: 'success',
      data: {
        consultation: existingConsultation,
      },
    });
  }

  // Create consultation
  const consultation = await Consultation.create({
    appointment: appointmentId,
    patient: appointment.user._id,
    practitioner: appointment.practitioner._id,
    startTime: appointment.startTime,
    endTime: appointment.endTime,
  });

  await consultation.populate('patient practitioner appointment');

  res.status(201).json({
    status: 'success',
    data: {
      consultation,
    },
  });
});

// Get consultation by ID
exports.getConsultation = catchAsync(async (req, res, next) => {
  const consultation = await Consultation.findById(req.params.id)
    .populate('patient practitioner appointment');

  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  // Check authorization
  if (consultation.patient._id.toString() !== req.user.id && 
      consultation.practitioner._id.toString() !== req.user.id &&
      req.user.role !== 'admin') {
    return next(new AppError('Not authorized to access this consultation', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      consultation,
    },
  });
});

// Get consultation by room ID
exports.getConsultationByRoom = catchAsync(async (req, res, next) => {
  const { roomId } = req.params;
  
  const consultation = await Consultation.findOne({ roomId })
    .populate('patient practitioner appointment');

  if (!consultation) {
    return next(new AppError('Consultation room not found', 404));
  }

  // Check authorization
  if (consultation.patient._id.toString() !== req.user.id && 
      consultation.practitioner._id.toString() !== req.user.id &&
      req.user.role !== 'admin') {
    return next(new AppError('Not authorized to access this consultation', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      consultation,
    },
  });
});

// Get user's consultations
exports.getMyConsultations = catchAsync(async (req, res, next) => {
  const { status, limit = 10, page = 1 } = req.query;
  
  const query = {
    $or: [
      { patient: req.user.id },
      { practitioner: req.user.id }
    ]
  };

  if (status) {
    query.status = status;
  }

  const consultations = await Consultation.find(query)
    .populate('patient practitioner appointment')
    .sort({ startTime: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Consultation.countDocuments(query);

  res.status(200).json({
    status: 'success',
    results: consultations.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page * 1,
    data: {
      consultations,
    },
  });
});

// Start consultation
exports.startConsultation = catchAsync(async (req, res, next) => {
  const consultation = await Consultation.findById(req.params.id);

  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  // Check authorization
  if (consultation.patient.toString() !== req.user.id && 
      consultation.practitioner.toString() !== req.user.id &&
      req.user.role !== 'admin') {
    return next(new AppError('Not authorized to start this consultation', 403));
  }

  // Start consultation
  await consultation.startConsultation();
  await consultation.addParticipant(req.user.id);

  await consultation.populate('patient practitioner appointment');

  res.status(200).json({
    status: 'success',
    data: {
      consultation,
    },
  });
});

// End consultation
exports.endConsultation = catchAsync(async (req, res, next) => {
  const { notes, patientNotes, practitionerNotes } = req.body;
  
  const consultation = await Consultation.findById(req.params.id);

  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  // Check authorization (only practitioner can end consultation)
  if (consultation.practitioner.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Only the practitioner can end the consultation', 403));
  }

  // End consultation
  await consultation.endConsultation(notes);
  
  if (patientNotes) consultation.patientNotes = patientNotes;
  if (practitionerNotes) consultation.practitionerNotes = practitionerNotes;
  
  await consultation.save();
  await consultation.populate('patient practitioner appointment');

  res.status(200).json({
    status: 'success',
    data: {
      consultation,
    },
  });
});

// Join consultation
exports.joinConsultation = catchAsync(async (req, res, next) => {
  const consultation = await Consultation.findById(req.params.id);

  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  // Check authorization
  if (consultation.patient.toString() !== req.user.id && 
      consultation.practitioner.toString() !== req.user.id &&
      req.user.role !== 'admin') {
    return next(new AppError('Not authorized to join this consultation', 403));
  }

  // Add participant
  await consultation.addParticipant(req.user.id);
  await consultation.populate('patient practitioner appointment');

  res.status(200).json({
    status: 'success',
    data: {
      consultation,
    },
  });
});

// Leave consultation
exports.leaveConsultation = catchAsync(async (req, res, next) => {
  const consultation = await Consultation.findById(req.params.id);

  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  // Remove participant
  await consultation.removeParticipant(req.user.id);
  await consultation.populate('patient practitioner appointment');

  res.status(200).json({
    status: 'success',
    data: {
      consultation,
    },
  });
});

// Add consultation notes
exports.addNotes = catchAsync(async (req, res, next) => {
  const { notes, type } = req.body; // type: 'general', 'patient', 'practitioner'
  
  const consultation = await Consultation.findById(req.params.id);

  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  // Check authorization
  if (consultation.patient.toString() !== req.user.id && 
      consultation.practitioner.toString() !== req.user.id &&
      req.user.role !== 'admin') {
    return next(new AppError('Not authorized to add notes to this consultation', 403));
  }

  // Add notes based on type and user role
  if (type === 'patient' && consultation.patient.toString() === req.user.id) {
    consultation.patientNotes = notes;
  } else if (type === 'practitioner' && consultation.practitioner.toString() === req.user.id) {
    consultation.practitionerNotes = notes;
  } else {
    consultation.notes = notes;
  }

  await consultation.save();
  await consultation.populate('patient practitioner appointment');

  res.status(200).json({
    status: 'success',
    data: {
      consultation,
    },
  });
});

// Submit feedback
exports.submitFeedback = catchAsync(async (req, res, next) => {
  const { rating, feedback, technicalRating } = req.body;
  
  const consultation = await Consultation.findById(req.params.id);

  if (!consultation) {
    return next(new AppError('Consultation not found', 404));
  }

  // Check authorization
  if (consultation.patient.toString() !== req.user.id && 
      consultation.practitioner.toString() !== req.user.id) {
    return next(new AppError('Not authorized to submit feedback for this consultation', 403));
  }

  // Add feedback based on user role
  if (consultation.patient.toString() === req.user.id) {
    consultation.feedback.patientRating = rating;
    consultation.feedback.patientFeedback = feedback;
  } else if (consultation.practitioner.toString() === req.user.id) {
    consultation.feedback.practitionerRating = rating;
    consultation.feedback.practitionerFeedback = feedback;
  }

  if (technicalRating) {
    consultation.feedback.technicalRating = technicalRating;
  }

  await consultation.save();
  await consultation.populate('patient practitioner appointment');

  res.status(200).json({
    status: 'success',
    data: {
      consultation,
    },
  });
});

// Get active consultations (admin only)
exports.getActiveConsultations = catchAsync(async (req, res, next) => {
  const consultations = await Consultation.find({ status: 'active' })
    .populate('patient practitioner appointment')
    .sort({ actualStartTime: -1 });

  res.status(200).json({
    status: 'success',
    results: consultations.length,
    data: {
      consultations,
    },
  });
});

// Get consultation statistics (admin only)
exports.getConsultationStats = catchAsync(async (req, res, next) => {
  const stats = await Consultation.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
      },
    },
  ]);

  const totalConsultations = await Consultation.countDocuments();
  const todayConsultations = await Consultation.countDocuments({
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  });

  const avgRating = await Consultation.aggregate([
    {
      $group: {
        _id: null,
        avgPatientRating: { $avg: '$feedback.patientRating' },
        avgPractitionerRating: { $avg: '$feedback.practitionerRating' },
        avgTechnicalRating: { $avg: '$feedback.technicalRating' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      statusStats: stats,
      totalConsultations,
      todayConsultations,
      averageRatings: avgRating[0] || {},
    },
  });
});
