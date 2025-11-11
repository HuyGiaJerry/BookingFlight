const CrudRepository = require('./crud-repository');
const { FlightSchedule, Flight, FlightScheduleFare, Seat, Airport, Airplane, Airline } = require('../models');
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

    async getScheduleWithDetails(scheduleId) {
        try {
            const schedule = await FlightSchedule.findByPk(scheduleId, {
                include: [
                    {
                        model: Flight,
                        as: 'flight',
                        include: [
                            { model: Airport, as: 'departureAirport' },
                            { model: Airport, as: 'arrivalAirport' },
                            {
                                model: Airplane,
                                as: 'airplane',
                                include: [{ model: Airline, as: 'airline' }]
                            }
                        ]
                    },
                    {
                        model: FlightScheduleFare,
                        as: 'fares'
                    },
                    {
                        model: Seat,
                        as: 'seats',
                        where: { seat_status: 'available' },
                        required: false
                    }
                ]
            });
            return schedule;
        } catch (error) {
            throw error;
        }
    }

    async checkScheduleAvailability(scheduleId, passengerCount) {
        try {
            const schedule = await FlightSchedule.findByPk(scheduleId);
            if (!schedule) return false;
            return schedule.available_seat >= passengerCount;
        } catch (error) {
            throw error;
        }
    }

    async updateAvailableSeats(scheduleId, seatsChange) {
        try {
            const schedule = await FlightSchedule.findByPk(scheduleId);

            if (!schedule) throw new Error('Flight schedule not found');

            await this.update(scheduleId, { available_seat: newAvailableSeats });

            return newAvailableSeats;
        } catch (error) {
            throw error;
        }
    }



}

module.exports = FlightScheduleRepository;