const express = require('express');
const SeatController = require('../../controllers/seat-controller');

const router = express.Router();
const seatController = new SeatController();

// ✅ MAIN: Seat matrix routes
router.get('/matrix/:flightScheduleId', seatController.getSeatMatrix); // ?classId=1 optional
router.get('/summary/:flightScheduleId', seatController.getSeatSummary); // Class summary
router.get('/class/:flightScheduleId/:classId', seatController.getSeatsByClass); // Specific class

// ✅ UTILITY: Admin/debug routes
router.get('/debug/:flightScheduleId', seatController.debugSeatLayout); // ?classId=1 optional
router.post('/check-availability', seatController.checkSeatAvailability);

module.exports = router;