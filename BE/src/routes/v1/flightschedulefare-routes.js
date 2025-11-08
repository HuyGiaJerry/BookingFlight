const express = require('express');
const {FlightScheduleFareController} = require('../../controllers');

const router = express.Router();

router.post('/', FlightScheduleFareController.createFlightScheduleFare);
router.get('/:id', FlightScheduleFareController.getFlightScheduleFare);
router.get('/', FlightScheduleFareController.getFlightScheduleFares);
router.put('/:id', FlightScheduleFareController.updateFlightScheduleFare);
router.delete('/:id', FlightScheduleFareController.deleteFlightScheduleFare);

module.exports = router;