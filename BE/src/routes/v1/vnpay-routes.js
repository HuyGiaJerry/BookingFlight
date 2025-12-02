const express = require('express');
const router = express.Router();
const vnpayController = require('../../controllers/vnpay-controller');

router.post('/create', vnpayController.createPayment);
router.get('/return', vnpayController.returnUrl);
router.get('/ipn', vnpayController.ipnUrl);

module.exports = router;