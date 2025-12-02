const RoleRepository = require('./role-repository');
const SeatClassRepository = require('./seat-class-repository');
const sessionRepository = require('./session-repository');
const UserRepository = require('./user-repository');

module.exports = {
    AirportRepository: require('./airport-repository'),
    AirlineRepository: require('./airline-repository'),
    AirplaneRepository: require('./airplane-repository'),
    FlightRepository: require('./flight-repository'),
    UserRepository: require('./user-repository'),
    SessionRepository: require('./session-repository'),
    RoleRepository: require('./role-repository'),

    BookingRepository: require('./booking-repository'),
    PassengerRepository: require('./passenger-repository'),
    SeatRepository: require('./seat-repository'),
    ServicesRepository: require('./services-repository'),
    TicketRepository: require('./ticket-repository'),
    SeatClassRepository: require('./seat-class-repository'),
}