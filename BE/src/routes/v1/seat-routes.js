const express = require('express');
const SeatController = require('../../controllers/seat-controller');

const router = express.Router();
const seatController = new SeatController();

// ✅ UPDATED: Existing routes now use Traveloka style
router.get('/matrix/:flightScheduleId', seatController.getSeatMatrix);

// ✅ KEEP: Admin/debug routes
router.get('/debug/:flightScheduleId', seatController.debugSeatLayout);
router.post('/check-availability', seatController.checkSeatAvailability);

module.exports = router;