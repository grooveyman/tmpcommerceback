import express from "express";
import { authenticate} from "../middleware/authMiddleware.js";
import { addToCart, getUserCart, removeCartItem } from "../controllers/cartController.js";

const router = express.Router();

router.route('/cart').post(authenticate, addToCart).get(authenticate, getUserCart).delete(authenticate, removeCartItem);

export default router;