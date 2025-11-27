const TokenService = require('./token-service');
const UserService = require('./user-service');

module.exports = {
    AirportService: require('./airport-service'),
    AirlineService: require('./airline-service'),
    AirplaneService: require('./airplane-service'),
    FlightService: require('./flight-service'),
    UserService: require('./user-service'),
    TokenService: require('./token-service'),

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
}