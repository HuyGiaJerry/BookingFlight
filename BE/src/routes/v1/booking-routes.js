const express = require('express');
const BookingController = require('../../controllers/booking-controller');

const router = express.Router();
const bookingController = new BookingController();

// Lấy dữ liệu saved passenger của user nếu đăng nhập , rules 
router.get('/basic-data', bookingController.getBookingBasicData);

// ✅ Existing routes
router.post('/validate-form', bookingController.validateBookingForm);
router.post('/calculate-preview', bookingController.calculateBookingPreview);
router.post('/create-complete', bookingController.createCompleteBooking);
router.get('/:bookingId', bookingController.getBookingDetails);

// ✅ THÊM: Mock auto-assign + create booking APIs
router.post('/auto-assign-seats', bookingController.autoAssignPendingSeats);
router.post('/create-from-session', bookingController.createBookingFromSession);

module.exports = router;