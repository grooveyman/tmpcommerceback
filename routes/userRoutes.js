import express from "express";
// const validateToken = require("../middleware/validateToken");
import {createUser, loginUser, logoutCurrentUser, getAllUsers, getCurrentUserProfile, updateCurrentUserProfile, deleteUserById, getUserById, updateUserById, refreshTheToken} from "../controllers/userController.js";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
router.route('/register').post(createUser).get(authenticate, authorizeAdmin, getAllUsers);
router.route('/auth/login').post(loginUser);
router.route('/auth/logout').post(logoutCurrentUser);
router.route('/profile').get(authenticate, getCurrentUserProfile).put(authenticate, updateCurrentUserProfile);

//refresh token route
router.route('/auth/refresh').post(refreshTheToken);


//ADMIN ROUTEs
router.route('/:id').delete(authenticate, authorizeAdmin, deleteUserById).get(authenticate, authorizeAdmin, getUserById).put(authenticate, authorizeAdmin, updateUserById); 

export default router;