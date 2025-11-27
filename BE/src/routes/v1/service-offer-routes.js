const express = require('express');
const ServiceOfferController = require('../../controllers/service-offer-controller');

const router = express.Router();
const serviceController = new ServiceOfferController();

// 🔸 Flight services
router.get('/flight/:flightScheduleId', serviceController.getFlightServices);

// 🔸 Meal options
router.get('/meals/:flightScheduleId', serviceController.getMealOptions);

// 🔸 Baggage options
router.get('/baggage/:flightScheduleId', serviceController.getBaggageOptions);

// 🔸 Check availability
router.post('/check-availability', serviceController.checkServiceAvailability);


module.exports = router;