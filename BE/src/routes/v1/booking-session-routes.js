const express = require('express');
const {BookingSessionController} = require('../../controllers');
const router = express.Router();
const bookingSessionController = new BookingSessionController();

// POST /api/v1/booking-session/save-contact-passengers
router.post('/save-contact-passengers', bookingSessionController.saveContactAndPassengers);

// GET /api/v1/booking-session/:booking_session_id
router.get('/:booking_session_id', bookingSessionController.getBookingSessionById);
module.exports = router;