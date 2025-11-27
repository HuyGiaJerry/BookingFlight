const express = require('express');
const ServiceSelectionController = require('../../controllers/service-selection-controller');

const router = express.Router();
const serviceSelectionController = new ServiceSelectionController();

/**
 * 🍽️ MEAL SELECTION ROUTES
 */
// Add meal selection cho passenger
// POST /api/v1/service-selection/add-meal
// Body: { flight_schedule_id, passenger_index, service_offer_id, booking_session_id?, quantity?, account_id? }
router.post('/add-meal', serviceSelectionController.addMealSelection);

// Remove meal selection cho passenger
// DELETE /api/v1/service-selection/remove-meal
// Body: { booking_session_id, flight_schedule_id, passenger_index }
router.delete('/remove-meal', serviceSelectionController.removeMealSelection);

/**
 * 🎒 BAGGAGE SELECTION ROUTES
 */
// Add baggage selection cho passenger
// POST /api/v1/service-selection/add-baggage
// Body: { flight_schedule_id, passenger_index, service_offer_id, booking_session_id?, quantity?, account_id? }
router.post('/add-baggage', serviceSelectionController.addBaggageSelection);

// Remove baggage selection cho passenger
// DELETE /api/v1/service-selection/remove-baggage
// Body: { booking_session_id, flight_schedule_id, passenger_index }
router.delete('/remove-baggage', serviceSelectionController.removeBaggageSelection);

/**
 * 🛠️ BULK SELECTION ROUTES
 */
// Select multiple services cho flight (meals + baggage)
// POST /api/v1/service-selection/select-services
// Body: { 
//   flight_schedule_id, 
//   service_selections: [
//     {passenger_index, service_offer_id, quantity, service_category: 'MEAL'|'BAGGAGE'}
//   ],
//   booking_session_id?, account_id?
// }
router.post('/select-services', serviceSelectionController.selectServicesForFlight);

/**
 * 📊 SESSION MANAGEMENT ROUTES
 */
// Get current service selections cho session
// GET /api/v1/service-selection/:sessionId
router.get('/:sessionId', serviceSelectionController.getSessionServiceSelections);

// Complete service selection process
// POST /api/v1/service-selection/:sessionId/complete
router.post('/:sessionId/complete', serviceSelectionController.completeServiceSelection);

// Extend session expiry
// PUT /api/v1/service-selection/:sessionId/extend
// Body: { minutes?: 15 }
router.put('/:sessionId/extend', serviceSelectionController.extendSession);

module.exports = router;