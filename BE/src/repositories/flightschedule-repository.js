const CrudRepository = require('./crud-repository');
const {FlightSchedule} = require('../models');

class FlightScheduleRepository extends CrudRepository {
    constructor() {
        super(FlightSchedule);
    }

    
}

module.exports = FlightScheduleRepository;