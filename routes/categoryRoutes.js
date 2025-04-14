const express = require('express');
const { createCategory, getAllCategories, updateCategory, getCategoryById, deleteCategory } = require('../controllers/categoryController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
router.route('/category').post(authenticate, authorizeAdmin, createCategory).get(authenticate, getAllCategories);
router.route('/category/:id').put(authenticate, authorizeAdmin, updateCategory).get(authenticate, authorizeAdmin, getCategoryById).delete(authenticate, authorizeAdmin, deleteCategory);

module.exports = router;