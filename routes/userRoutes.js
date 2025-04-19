const express = require("express");
// const validateToken = require("../middleware/validateToken");
const {createUser, loginUser, logoutCurrentUser, getAllUsers, getCurrentUserProfile, updateCurrentUserProfile, deleteUserById, getUserById, updateUserById, refreshTheToken, resendVerification, verifyEmail, sendResetPasswordEmail, changePassword} = require("../controllers/userController");
const { authenticate, authorizeAdmin } = require("../middleware/authMiddleware");
const  { checkEmailVerify } = require("../middleware/checkEmailVerify");

const router = express.Router();
router.route('/auth/register').post(createUser).get(authenticate, authorizeAdmin, getAllUsers);
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

module.exports = router;