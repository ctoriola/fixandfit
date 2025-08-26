const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// User routes
router.get('/me', userController.getMe);
router.patch('/updateMe', userController.updateMe);

// Admin only routes
router.use(authController.restrictTo('admin'));

router.get('/', userController.getAllUsers);
router.get('/stats', userController.getUserStats);
router.post('/create-admin', userController.createAdmin);
router.patch('/:id/role', userController.updateUserRole);
router.delete('/:id', userController.deleteUser);

module.exports = router;
