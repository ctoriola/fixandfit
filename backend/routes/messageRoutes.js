const express = require('express');
const messageController = require('../controllers/messageController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Routes for all authenticated users
router.get('/inbox', messageController.getMyMessages);
router.get('/sent', messageController.getSentMessages);
router.get('/recipients', messageController.getAvailableRecipients);
router.get('/conversation/:userId', messageController.getConversation);
router.post('/', messageController.sendMessage);

// Routes for specific messages
router
  .route('/:id')
  .get(messageController.getMessage)
  .patch(messageController.archiveMessage);

router.patch('/:id/read', messageController.markAsRead);
router.patch('/mark-read', messageController.markMultipleAsRead);

// Admin only routes
router.get(
  '/admin/all',
  authController.restrictTo('admin'),
  messageController.getAllMessages
);

router.get(
  '/admin/stats',
  authController.restrictTo('admin'),
  messageController.getMessageStats
);

module.exports = router;
