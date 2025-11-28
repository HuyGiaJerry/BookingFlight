const express = require('express');


const { HomeController } = require('../../controllers');
const authRouter = require('./auth-routes');
const airportRouter = require('./airport-routes');
const airlineRouter = require('./airline-routes');
const airplaneRouter = require('./airplane-routes');
const flightRouter = require('./flight-routes');
const roleRouter = require('./role-rotes');
const passengerRouter = require('./passenger-routes');
// const flightScheduleRouter = require('./flightschedule-routes');
// const flightScheduleFareRouter = require('./flightschedulefare-routes');
// const oauthRouter = require('./oauth-routes');
// const bookingRouter = require('./booking-routes');
const { ProtectedRoutes } = require('../../middlewares');

const bookingRoutes = require('./booking-routes');
const seatRoutes = require('./seat-routes');
const serviceOfferRoutes = require('./service-offer-routes');
const passengerRoutes = require('./passenger-routes');
const flightSummaryRoutes = require('./flight-summary-routes');
const seatSelectionRoutes = require('./seat-selection-routes');
const servicesSelectionRoutes = require('./services-selection-routes');
const flightSelectionRoutes = require('./flight-selection-routes');
// const oauthRouter = require('./oauth-routes');
// const {ProtectedRoutes} = require('../../middlewares');
const router = express.Router();


// public routes
router.use('/auth', authRouter);
router.use('/airports', airportRouter);
router.use('/airlines', airlineRouter);
router.use('/airplanes', airplaneRouter);
router.use('/flights', flightRouter);
router.use('/roles', roleRouter)
// router.use('/flight-schedules', flightScheduleRouter);
// router.use('/flight-schedule-fares', flightScheduleFareRouter);
router.use('/flight-summary', flightSummaryRoutes);

// router.use('/oauth', oauthRouter);


router.use('/booking', bookingRoutes);
router.use('/seats', seatRoutes);
router.use('/services', serviceOfferRoutes);
router.use('/passengers', passengerRoutes);
router.use('/seat-selection', seatSelectionRoutes);
router.use('/service-selection', servicesSelectionRoutes);
router.use('/flight-selection', flightSelectionRoutes);

// test router

// private routes
router.use(ProtectedRoutes);
router.get('/home', HomeController.home);





module.exports = router;