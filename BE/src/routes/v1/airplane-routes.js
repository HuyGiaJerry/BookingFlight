const express = require('express');
const {AirplaneController} = require('../../controllers');
const router = express.Router();

router.post('/', AirplaneController.createAirplane);
router.get('/', AirplaneController.getAllAirplanes);
router.get('/:id', AirplaneController.getAirplaneByAirplaneId);
router.get('/airline/:id', AirplaneController.getAirplanesByAirlineId);
router.put('/:id', AirplaneController.updateAirplane);
router.delete('/:id', AirplaneController.deleteAirplane);

module.exports = router;