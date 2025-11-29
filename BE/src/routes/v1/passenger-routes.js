const express = require('express');
const PassengerController = require('../../controllers/passenger-controller');

const router = express.Router();
const passengerController = new PassengerController();

// ✅ CRUD Routes
// 🔸 User passengers (GET all with optional pagination)
router.get('/user/:accountId', passengerController.getUserPassengers); // ?page=1&limit=10

// 🔸 Get passenger by ID
router.get('/:passengerId', passengerController.getPassengerById); // ?accountId=123

// 🔸 Create passenger
router.post('/create', passengerController.createPassenger);

// 🔸 Update passenger
router.put('/:passengerId', passengerController.updatePassenger);

// 🔸 Delete passenger (soft delete)
router.delete('/:passengerId', passengerController.deletePassenger);

// 🔸 Restore passenger
router.patch('/:passengerId/restore', passengerController.restorePassenger);

// ✅ Additional Features
// 🔸 Search passengers
router.get('/search/:accountId', passengerController.searchPassengers); // ?q=john

// 🔸 Get passenger statistics
router.get('/stats/:accountId', passengerController.getPassengerStats);

// 🔸 Validate passenger data
router.post('/validate', passengerController.validatePassengerData);


module.exports = router;
