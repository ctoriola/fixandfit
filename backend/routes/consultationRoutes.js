const express = require('express');
const consultationController = require('../controllers/consultationController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes
router.use(authController.protect);

// User routes
router.get('/my-consultations', consultationController.getMyConsultations);
router.get('/room/:roomId', consultationController.getConsultationByRoom);
router.get('/:id', consultationController.getConsultation);

router.post('/appointment/:appointmentId', consultationController.createConsultation);
router.patch('/:id/start', consultationController.startConsultation);
router.patch('/:id/end', consultationController.endConsultation);
router.patch('/:id/join', consultationController.joinConsultation);
router.patch('/:id/leave', consultationController.leaveConsultation);
router.patch('/:id/notes', consultationController.addNotes);
router.patch('/:id/feedback', consultationController.submitFeedback);

// Admin only routes
router.use(authController.restrictTo('admin', 'staff'));
router.get('/', consultationController.getActiveConsultations);
router.get('/stats/overview', consultationController.getConsultationStats);

module.exports = router;
