import express from "express";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import { createOrder, updateOrder, getAllOrders } from "../controllers/orderController.js";

const router = express.Router();
router.route('/order').post(authenticate, createOrder).get(authenticate, getAllOrders);
router.route('/order/:id').put(authenticate, authorizeAdmin, updateOrder); //updates are only for payments

export default router;