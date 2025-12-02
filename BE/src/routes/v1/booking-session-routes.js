const express = require('express');
const {BookingSessionController} = require('../../controllers');
const router = express.Router();
const bookingSessionController = new BookingSessionController();

// POST /api/v1/booking-session/save-contact-passengers
router.post('/save-contact-passengers', bookingSessionController.saveContactAndPassengers);

module.exports = router;