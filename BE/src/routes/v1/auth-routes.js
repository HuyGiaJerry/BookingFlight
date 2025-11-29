const express = require('express');
const router = express.Router();
const { AuthController } = require('../../controllers');
const validateSignUp = require('../../validations/validateSignUp');

// localhost:3600/api/v1/users    POST
router.post('/signup', validateSignUp, AuthController.signUp);
router.post('/signin', AuthController.signIn);
router.post('/signout', AuthController.signOut);
router.post('/refresh_token', AuthController.refreshToken)
router.post('/verify_otp', AuthController.verifyOtp)

module.exports = router;    