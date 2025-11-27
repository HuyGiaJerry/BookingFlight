const express = require('express');
const { FlightController } = require('../../controllers');
const router = express.Router();

router.post('/', FlightController.createFlight);
router.get('/fullsearch', FlightController.fullSearch);
router.get('/search', FlightController.searchFlights);
router.get('/', FlightController.getAllFlights);
router.get('/:id', FlightController.getFlightById);
router.put('/:id', FlightController.updateFlight);
router.delete('/:id', FlightController.deleteFlight);


module.exports = router;