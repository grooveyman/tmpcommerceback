const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { addToCart, getUserCart, removeCartItem } = require('../controllers/cartController');

const router = express.Router();

router.route('/cart').post(authenticate, addToCart).get(authenticate, getUserCart).delete(authenticate, removeCartItem);

module.exports = router;