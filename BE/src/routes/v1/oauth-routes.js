const express = require('express');
const { redirectToGoogleAuth, handleGoogleCallback } = require('../../controllers/oauth-controller');

const router = express.Router();

router.get('/google', redirectToGoogleAuth);
router.get('/google/callback', handleGoogleCallback);

module.exports = router;