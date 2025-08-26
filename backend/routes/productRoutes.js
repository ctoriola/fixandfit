const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/categories', productController.getCategories);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:slug', productController.getProduct);

// Protected routes (admin only)
router.use(authController.protect);
router.use(authController.restrictTo('admin'));

router.post('/', productController.createProduct);
router
  .route('/:id')
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
