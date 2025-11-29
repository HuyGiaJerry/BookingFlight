const express = require('express');
const router = express.Router();
const { AuthController } = require('../../controllers');
const validateSignUp = require('../../validations/validateSignUp');

// ✅ AUTHENTICATION ROUTES
router.post('/signup', validateSignUp, AuthController.signUp);
router.post('/signin', AuthController.signIn);
router.post('/signout', AuthController.signOut);
router.post('/refresh_token', AuthController.refreshToken);
router.post('/verify_otp', AuthController.verifyOtp);

// ✅ ACCOUNT INFO ROUTES - Lấy thông tin account và permissions
router.get('/my-accounts', AuthController.getAccountDetails);
router.get('/profile', AuthController.getUserProfile);
router.post('/check-permission', AuthController.checkPermission);

module.exports = router;