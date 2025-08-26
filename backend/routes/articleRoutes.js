const express = require('express');
const articleController = require('../controllers/articleController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.get('/', articleController.getArticles);
router.get('/popular', articleController.getPopularArticles);
router.get('/featured', articleController.getFeaturedArticles);
router.get('/categories', articleController.getCategories);
router.get('/:slug', articleController.getArticle);

// Protected routes (require authentication)
router.use(authController.protect);

router.patch('/:id/like', articleController.likeArticle);
router.patch('/:id/unlike', articleController.unlikeArticle);
router.post('/:id/comments', articleController.addComment);

// Admin/Staff only routes
router.use(authController.restrictTo('admin', 'staff'));

router.get('/admin/all', articleController.getAllArticles);
router.get('/admin/stats', articleController.getArticleStats);
router.post('/admin/create', articleController.createArticle);
router.patch('/admin/:id', articleController.updateArticle);
router.delete('/admin/:id', articleController.deleteArticle);
router.patch('/admin/:id/comments/:commentId/approve', articleController.approveComment);

module.exports = router;
