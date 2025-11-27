const TokenService = require('./token-service');
const UserService = require('./user-service');

module.exports = {
    AirportService: require('./airport-service'),
    AirlineService: require('./airline-service'),
    AirplaneService: require('./airplane-service'),
    FlightService: require('./flight-service'),
<<<<<<< HEAD
    UserService: require('./user-service'),
    TokenService: require('./token-service')
=======

    PassengerService: require('./passenger-service'),
    SeatService: require('./seat-service'),
    BookingService: require('./booking-service'),
    BookingPageService: require('./booking-page-service'),
    ServiceOfferService: require('./service-offer-service'),
    TicketService: require('./ticket-service'),
    FlightSummaryService: require('./flight-summary-service'),
    SeatSelectionService: require('./seat-selection-service'),
    ServiceSelectionService: require('./service-selection-service'),
    SeatCleanupService: require('./seat-cleanup-service'),
    SessionManagerService: require('./session-manager-service'),
    FlightSelectionService: require('./flight-selection-service'),
>>>>>>> aac3e3aa5b51aa7a0858834e9213a0f82d645342
}