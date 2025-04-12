import express from "express";
// const validateToken = require("../middleware/validateToken");
import {createUser, loginUser, logoutCurrentUser, getAllUsers, getCurrentUserProfile, updateCurrentUserProfile, deleteUserById, getUserById, updateUserById, refreshTheToken, resendVerification, verifyEmail, sendResetPasswordEmail, changePassword} from "../controllers/userController.js";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";
import { checkEmailVerify } from "../middleware/checkEmailVerify.js";

const router = express.Router();
router.route('/register').post(createUser).get(authenticate, authorizeAdmin, getAllUsers);
router.route('/auth/login').post(checkEmailVerify, loginUser);
router.route('/auth/logout').post(logoutCurrentUser);
router.route('/profile').get(authenticate, getCurrentUserProfile).put(authenticate, updateCurrentUserProfile);

//refresh token route
router.route('/auth/refresh').post(refreshTheToken);

//email verification
router.route('/auth/verify/:verificationCode').get(verifyEmail);
//resend verification
router.route('/auth/verify/resend').post(resendVerification);

//password reset
router.route('/auth/initiate-reset').post(sendResetPasswordEmail);
//password reset completion
router.route('/auth/reset/:resetToken').post(changePassword);
//ADMIN ROUTES
router.route('/:id').delete(authenticate, authorizeAdmin, deleteUserById).get(authenticate, authorizeAdmin, getUserById).put(authenticate, authorizeAdmin, updateUserById); 

export default router;