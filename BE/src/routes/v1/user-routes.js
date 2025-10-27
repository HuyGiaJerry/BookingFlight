const express = require('express');
const router = express.Router();
const { UserController } = require('../../controllers');

// localhost:3600/api/v1/users    POST
router.post('/', UserController.createUser);

module.exports = router;