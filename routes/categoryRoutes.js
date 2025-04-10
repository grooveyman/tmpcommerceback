import express from "express";
import {createCategory, getAllCategories, updateCategory, getCategoryById, deleteCategory } from "../controllers/categoryController.js";
import  { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
router.route('/category').post(authenticate, authorizeAdmin, createCategory).get(authenticate, getAllCategories);
router.route('/category/:id').put(authenticate, authorizeAdmin, updateCategory).get(authenticate, authorizeAdmin, getCategoryById).delete(authenticate, authorizeAdmin, deleteCategory);

export default router;