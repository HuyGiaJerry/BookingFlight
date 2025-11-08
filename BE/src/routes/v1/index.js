const express = require('express');

const {HomeController} = require('../../controllers');
const authRouter = require('./auth-routes');
const airportRouter = require('./airport-routes');
const airlineRouter = require('./airline-routes');
const airplaneRouter = require('./airplane-routes');
const flightRouter = require('./flight-routes');
const flightScheduleRouter = require('./flightschedule-routes');
const flightScheduleFareRouter = require('./flightschedulefare-routes');
const {ProtectedRoutes} = require('../../middlewares');
const router = express.Router();


// public routes
router.use('/auth', authRouter);
router.use('/airports', airportRouter);
router.use('/airlines', airlineRouter);
router.use('/airplanes', airplaneRouter);
router.use('/flights', flightRouter);
router.use('/flight-schedules', flightScheduleRouter);
router.use('/flight-schedule-fares', flightScheduleFareRouter);
// test router
router.get('/home', HomeController.home);

// private routes
router.use(ProtectedRoutes);



module.exports = router;