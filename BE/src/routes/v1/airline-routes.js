const express = require('express');
const router = express.Router();
const upload = require('../../middlewares/upload');
const {AirlineController} = require('../../controllers');

router.post('/', upload.single('logo_url'), AirlineController.createAirline);
router.get('/', AirlineController.getAllAirlines);
router.get('/:id', AirlineController.getAirlineById);
router.put('/:id', AirlineController.updateAirline);
router.delete('/:id', AirlineController.deleteAirline);

module.exports = router;