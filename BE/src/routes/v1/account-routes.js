const express = require('express');
const router = express.Router();
const AccountController = require('../../controllers/account-controller');

const { ProtectedRoutes } = require('../../middlewares/auth-middleware');

router.use(ProtectedRoutes);

router.get('/', AccountController.getAccount);

module.exports = router;





