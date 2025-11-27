// flight-summary-routes.js
const express = require('express');
const FlightSummaryController = require('../../controllers/flight-summary-controller');

const router = express.Router();
const flightSummaryController = new FlightSummaryController();

router.get('/summary', flightSummaryController.getFlightsSummary);

module.exports = router;