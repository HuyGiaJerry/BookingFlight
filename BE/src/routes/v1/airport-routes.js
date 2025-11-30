const express = require('express');
const router = express.Router();
const { authorize } = require('../../middlewares/rbac-middleware')
const { AirportController } = require('../../controllers');
// const { ProtectedRoutes } = require('../../middlewares');

// router.use(ProtectedRoutes);
router.post('/',  AirportController.createAirport);
router.get('/', AirportController.getAllAirports);
// router.get('/', authorize('airport.view'), AirportController.getAllAirports);
router.get('/search', AirportController.searchAirports);
router.get('/:id', AirportController.getAirportById);
router.put('/:id', AirportController.updateAirport);
router.delete('/:id', AirportController.deleteAirport);


module.exports = router;