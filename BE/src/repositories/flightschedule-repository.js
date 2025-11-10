const CrudRepository = require('./crud-repository');
const { FlightSchedule, Flight, FlightScheduleFare } = require('../models');
const { where } = require('sequelize');

class FlightScheduleRepository extends CrudRepository {
    constructor() {
        super(FlightSchedule);
    }

    async getAllFlightSchedules() {
        try {
            const flightSchedules = await FlightSchedule.findAll({
                attributes: ['id', 'departure_time', 'arrival_time', 'available_seat', 'price', 'flight_schedule_status'],
                include: [
                    {
                        model: Flight,
                        as: 'flight',
                        attributes: ['id', 'flight_number', 'departure_airport_id', 'arrival_airport_id', 'airplane_id', 'duration', 'base_price', 'flight_status']
                    }
                ]
            });
            return flightSchedules;
        }
        catch (error) {
            throw error;
        }
    }

}

module.exports = FlightScheduleRepository;