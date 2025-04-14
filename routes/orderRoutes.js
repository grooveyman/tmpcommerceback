const express = require('express');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const { createOrder, updateOrder, getAllOrders } = require('../controllers/orderController');

const router = express.Router();
router.route('/order').post(authenticate, createOrder).get(authenticate, getAllOrders);
router.route('/order/:id').put(authenticate, authorizeAdmin, updateOrder); //updates are only for payments

module.exports = router;