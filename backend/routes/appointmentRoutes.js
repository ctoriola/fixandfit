const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Routes for regular users
router.get('/my-appointments', appointmentController.getMyAppointments);
router.get('/available-slots', appointmentController.getAvailableSlots);
router.post('/', appointmentController.createAppointment);

// Routes for specific appointments
router
  .route('/:id')
  .get(appointmentController.getAppointment)
  .patch(appointmentController.updateAppointment);

router.patch('/:id/cancel', appointmentController.cancelAppointment);

// Admin/Staff only routes
router.get(
  '/all',
  authController.restrictTo('admin', 'staff'),
  appointmentController.getAllAppointments
);

router.get('/admin', authController.restrictTo('admin'), appointmentController.getAdminAppointments);


module.exports = router;
