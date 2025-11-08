const CrudRepository = require('./crud-repository');
const { FlightScheduleFare } = require('../models');

class FlightScheduleFareRepository extends CrudRepository {
    constructor() {
        super(FlightScheduleFare);
    }
}

module.exports = FlightScheduleFareRepository;