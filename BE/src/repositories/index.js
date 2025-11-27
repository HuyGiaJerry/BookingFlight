const RoleRepository = require('./role-repository');
const sessionRepository = require('./session-repository');
const UserRepository = require('./user-repository');

module.exports = {
    AirportRepository: require('./airport-repository'),
    AirlineRepository: require('./airline-repository'),
    AirplaneRepository: require('./airplane-repository'),
    FlightRepository: require('./flight-repository'),
<<<<<<< HEAD
    UserRepository: require('./user-repository'),
    SessionRepository: require('./session-repository'),
    RoleRepository: require('./role-repository')
=======
    
    BookingRepository: require('./booking-repository'),
    PassengerRepository: require('./passenger-repository'),
    SeatRepository: require('./seat-repository'),
    ServicesRepository: require('./services-repository'),
    TicketRepository: require('./ticket-repository'),
>>>>>>> aac3e3aa5b51aa7a0858834e9213a0f82d645342
}