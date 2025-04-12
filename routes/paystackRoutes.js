import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {initializePayment, verifyPayment, verifyWebHook} from "../controllers/payController.js";
import verify from "../middleware/verifyPayStackSignature";
const router = express.Router();

router.route('/pay').post(authenticate, initializePayment);
router.route('/verify/:id').post(authenticate, verifyPayment);
router.route('/verifywebhook/').post(verify, verifyWebHook);

export default router;