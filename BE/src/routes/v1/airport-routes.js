const express = require('express');
const router = express.Router();
const { AirportController } = require('../../controllers');

router.post('/', AirportController.createAirport);
router.get('/', AirportController.getAllAirports);
router.get('/search', AirportController.searchAirports);
router.get('/:id', AirportController.getAirportById);
router.put('/:id', AirportController.updateAirport);
router.delete('/:id', AirportController.deleteAirport);


module.exports = router;