const express = require('express');

const {HomeController} = require('../../controllers');
const router = express.Router();

router.get('/home', HomeController.home);

module.exports = router;