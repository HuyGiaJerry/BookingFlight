const express = require('express');
const FlightSelectionController = require('../../controllers/flight-selection-controller');

const router = express.Router();
const flightSelectionController = new FlightSelectionController();

/**
 * 🛫 FLIGHT SELECTION & BOOKING SESSION CREATION
 */

// POST /api/v1/flight-selection/create-session
// Body example:

// {
//   "outbound_flight_id": 123,
//   "return_flight_id": 456,
//   "seat_class_name": "ECONOMY",
//   "passengers": [
//     { "type": "ADULT", "count": 1 },
//     { "type": "CHILDREN", "count": 1 },
//     { "type": "INFANT", "count": 0 }
//   ],
//   "fare_price": {
//         "base_price": 1500000,
//         "service_fee": 150000,
//         "tax": 150000,
//         "total_price": 1800000
//    }
// }

router.post('/create-session', flightSelectionController.createFlightSelectionSession);

module.exports = router;