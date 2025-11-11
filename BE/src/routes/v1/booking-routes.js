const express = require('express');
const { BookingController } = require('../../controllers');
const router = express.Router();

// Initialize a new booking draft
router.post('/initialize', BookingController.initializeBooking);

// Phase 2: Get booking details and add passengers
router.get('/:bookingId/details', BookingController.getBookingDetails);
router.post('/:bookingId/passengers', BookingController.addPassengers);

// Phase 3: Seat selection
router.get('/flights/:flightScheduleId/seats', BookingController.getSeatLayout);
router.post('/:bookingId/seats', BookingController.selectSeats);

// Phase 4: Extra services
router.post('/:bookingId/services', BookingController.addExtraServices);

// Phase 5: Review and confirmation
router.get('/:bookingId/summary', BookingController.getBookingSummary);
router.post('/:bookingId/confirm', BookingController.confirmBooking);

// Phase 6: Ticket creation
router.post('/:bookingId/tickets', BookingController.createTickets);

// Phase 7: Cancel booking
router.delete('/:bookingId/cancel', BookingController.cancelBooking);

module.exports = router;