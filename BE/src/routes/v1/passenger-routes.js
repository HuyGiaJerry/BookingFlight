const express = require('express');
const PassengerController = require('../../controllers/passenger-controller');

const router = express.Router();
const passengerController = new PassengerController();

// 🔸 User passengers
router.get('/user/:accountId', passengerController.getUserPassengers);

// 🔸 Create passenger
router.post('/create', passengerController.createPassenger);

// 🔸 Validate passenger
router.post('/validate', passengerController.validatePassengerData);

module.exports = router;