const Appointment = require('../models/Appointment');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Get all appointments (admin/staff only)
exports.getAllAppointments = catchAsync(async (req, res, next) => {
  const appointments = await Appointment.find()
    .populate('patient', 'firstName lastName email phone')
    .populate('admin', 'firstName lastName email')
    .sort({ startTime: 1 });

  res.status(200).json({
    status: 'success',
    results: appointments.length,
    data: {
      appointments,
    },
  });
});

// Get user's appointments
exports.getMyAppointments = catchAsync(async (req, res, next) => {
  const appointments = await Appointment.find({ patient: req.user.id })
    .populate('admin', 'firstName lastName email')
    .sort({ startTime: 1 });

  res.status(200).json({
    status: 'success',
    results: appointments.length,
    data: {
      appointments,
    },
  });
});

// Get admin's appointments
exports.getAdminAppointments = catchAsync(async (req, res, next) => {
  const appointments = await Appointment.find({ admin: req.user.id })
    .populate('patient', 'firstName lastName email phone')
    .sort({ startTime: 1 });

  res.status(200).json({
    status: 'success',
    results: appointments.length,
    data: {
      appointments,
    },
  });
});

// Get single appointment
exports.getAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'firstName lastName email phone')
    .populate('admin', 'firstName lastName email');

  if (!appointment) {
    return next(new AppError('No appointment found with that ID', 404));
  }

  // Check if user has access to this appointment
  if (
    req.user.role === 'user' &&
    appointment.patient._id.toString() !== req.user.id
  ) {
    return next(new AppError('You do not have access to this appointment', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      appointment,
    },
  });
});

// Create new appointment
exports.createAppointment = catchAsync(async (req, res, next) => {
  const {
    appointmentType,
    startTime,
    endTime,
    reason,
    isVirtual,
  } = req.body;

  // Find an available admin user
  const adminUser = await User.findOne({ role: 'admin', isActive: true });
  if (!adminUser) {
    return next(new AppError('No admin available for appointment', 400));
  }

  // Validate appointment time
  const appointmentStart = new Date(startTime);
  const appointmentEnd = new Date(endTime);
  const now = new Date();

  if (appointmentStart < now) {
    return next(new AppError('Cannot book appointments in the past', 400));
  }

  if (appointmentEnd <= appointmentStart) {
    return next(new AppError('End time must be after start time', 400));
  }

  const newAppointment = await Appointment.create({
    patient: req.user.id,
    admin: adminUser._id,
    appointmentType,
    startTime: appointmentStart,
    endTime: appointmentEnd,
    reason,
    isVirtual: isVirtual || false,
  });

  await newAppointment.populate('admin', 'firstName lastName email');

  res.status(201).json({
    status: 'success',
    data: {
      appointment: newAppointment,
    },
  });
});

// Update appointment
exports.updateAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError('No appointment found with that ID', 404));
  }

  // Check permissions
  const canUpdate =
    req.user.role === 'admin' ||
    req.user.role === 'staff' ||
    appointment.patient.toString() === req.user.id;

  if (!canUpdate) {
    return next(new AppError('You do not have permission to update this appointment', 403));
  }

  const updatedAppointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  ).populate('patient admin', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    data: {
      appointment: updatedAppointment,
    },
  });
});

// Cancel appointment
exports.cancelAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError('No appointment found with that ID', 404));
  }

  // Check permissions
  const canCancel =
    req.user.role === 'admin' ||
    req.user.role === 'staff' ||
    appointment.patient.toString() === req.user.id;

  if (!canCancel) {
    return next(new AppError('You do not have permission to cancel this appointment', 403));
  }

  appointment.status = 'cancelled';
  appointment.cancelledAt = new Date();
  appointment.cancellationReason = req.body.reason || 'No reason provided';

  await appointment.save();

  res.status(200).json({
    status: 'success',
    data: {
      appointment,
    },
  });
});

// Get available time slots
exports.getAvailableSlots = catchAsync(async (req, res, next) => {
  const { date } = req.query;

  if (!date) {
    return next(new AppError('Date is required', 400));
  }

  // Find an available admin
  const adminUser = await User.findOne({ role: 'admin', isActive: true });
  if (!adminUser) {
    return next(new AppError('No admin available', 400));
  }

  const selectedDate = new Date(date);
  const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

  // Get existing appointments for the admin on the selected date
  const existingAppointments = await Appointment.find({
    admin: adminUser._id,
    startTime: { $gte: startOfDay, $lte: endOfDay },
    status: { $ne: 'cancelled' },
  }).select('startTime endTime');

  // Generate available slots (9 AM to 5 PM, 1-hour slots)
  const availableSlots = [];
  const workingHours = {
    start: 9,
    end: 17,
    slotDuration: 60, // minutes
  };

  for (let hour = workingHours.start; hour < workingHours.end; hour++) {
    const slotStart = new Date(selectedDate);
    slotStart.setHours(hour, 0, 0, 0);
    
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + workingHours.slotDuration);

    // Check if slot conflicts with existing appointments
    const isAvailable = !existingAppointments.some(appointment => {
      return (
        slotStart < appointment.endTime && slotEnd > appointment.startTime
      );
    });

    if (isAvailable && slotStart > new Date()) {
      availableSlots.push({
        startTime: slotStart,
        endTime: slotEnd,
      });
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      availableSlots,
    },
  });
});
