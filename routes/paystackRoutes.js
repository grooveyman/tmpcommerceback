import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {initializePayment, verifyPayment} from "../controllers/payController.js";

const router = express.Router();

router.route('/pay').post(authenticate, initializePayment);
router.route('/verify/:id').post(authenticate, verifyPayment);

export default router;