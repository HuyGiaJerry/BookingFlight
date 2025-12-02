const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

router.post("/vnpay/create", paymentController.createVNPayPayment);
router.get("/vnpay/return", paymentController.vnPayReturn);
router.get("/vnpay/ipn", paymentController.vnPayIPN);

module.exports = router;
