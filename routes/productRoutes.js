const express = require('express');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const {
  addProduct,
  getAllProducts,
  updateProduct,
  deleteProductById,
  getProductById,
  searchProducts,
  getProductsCat
} = require('../controllers/productController');
const upload = require('../config/multerConfig');


const router = express.Router();
router.route('/product').post(authenticate, upload.single('image'), addProduct).get(authenticate, getAllProducts);
router.route('/product/:id').put(authenticate, upload.single('image'),  updateProduct).delete(authenticate, deleteProductById).get(authenticate, getProductById);
router.route('/category/:catcode').get(authenticate, getProductsCat);
router.route('/search').get(authenticate, searchProducts);

module.exports = router;