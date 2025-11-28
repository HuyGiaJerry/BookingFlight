const express = require('express');
const FlightSelectionController = require('../../controllers/flight-selection-controller');

const router = express.Router();
const flightSelectionController = new FlightSelectionController();

/**
 * 🛫 FLIGHT SELECTION & SESSION CREATION
 */

// Create session from flight selection
// POST /api/v1/flight-selection/create-session
// Body: {
//   outbound_flight_id: 123,
//   return_flight_id?: 456,
//   passengers_count: 2,
//   seat_class_id: 1,
//   account_id?: 789
// }
router.post('/create-session', flightSelectionController.createFlightSelectionSession);

module.exports = router;