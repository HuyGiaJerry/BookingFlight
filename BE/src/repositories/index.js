const RoleRepository = require('./role-repository');
const sessionRepository = require('./session-repository');
const UserRepository = require('./user-repository');

module.exports = {
    AirportRepository: require('./airport-repository'),
    AirlineRepository: require('./airline-repository'),
    AirplaneRepository: require('./airplane-repository'),
    FlightRepository: require('./flight-repository'),
    UserRepository: require('./user-repository'),
    SessionRepository: require('./session-repository'),
    RoleRepository: require('./role-repository')
}