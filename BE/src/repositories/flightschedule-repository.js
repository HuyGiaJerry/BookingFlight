const CrudRepository = require('./crud-repository');
const { FlightSchedule, Flight, FlightScheduleFare } = require('../models');
const { where } = require('sequelize');

class FlightScheduleRepository extends CrudRepository {
    constructor() {
        super(FlightSchedule);
    }

    async getAllFlightSchedules(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            const { count, rows: flightSchedules } = await FlightSchedule.findAndCountAll({
                attributes: ['id', 'departure_time', 'arrival_time', 'available_seat', 'price', 'flight_schedule_status'],
                include: [
                    {
                        model: Flight,
                        as: 'flight',
                        attributes: ['id', 'flight_number', 'departure_airport_id', 'arrival_airport_id', 'airplane_id', 'duration', 'base_price', 'flight_status']
                    }
                ],
                limit: limitNum,
                offset: offset,
                orderBy: [['id', 'ASC']]
            });
            const pagination = {
                totalPages: Math.ceil(count / limitNum),
                currentPage: pageNum,
                limit: limitNum,
            }
            return {
                pagination,
                flightSchedules
            };
        }
        catch (error) {
            throw error;
        }
    }

}

module.exports = FlightScheduleRepository;