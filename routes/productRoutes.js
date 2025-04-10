import express from "express";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import { addProduct, getAllProducts, updateProduct, deleteProductById, getProductById, searchProducts, getProductsCat } from "../controllers/productController.js";
import upload from "../config/multerConfig.js";

const router = express.Router();
router.route('/product').post(authenticate, upload.single('image'), addProduct).get(authenticate, getAllProducts);
router.route('/product/:id').put(authenticate, upload.single('image'),  updateProduct).delete(authenticate, deleteProductById).get(authenticate, getProductById);
router.route('/category/:catcode').get(authenticate, getProductsCat);
router.route('/search').get(authenticate, searchProducts);

export default router;