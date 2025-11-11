const CrudRepository = require('./crud-repository');
const { Seat, AirplaneSeatLayout, sequelize } = require('../models');
const { where, op } = require('sequelize');

class SeatRepository extends CrudRepository {
    constructor() {
        super(Seat);
    }

    // Tìm các ghế theo flight_schedule_id
    async findByScheduleId(flightScheduleId) {
        return Seat.findAll({
            where: { flight_schedule_id: flightScheduleId },
            include: [{ model: AirplaneSeatLayout, as: 'layoutSeat' }],
        })
    }

    async getAvailableSeatsBySchedule(flightScheduleId) {
        try {
            console.log('Fetching available seats for flightScheduleId:', flightScheduleId);
            const seats = await Seat.findAll({
                where: {
                    flight_schedule_id: flightScheduleId,
                    seat_status: 'available'
                },
                include: [{ model: AirplaneSeatLayout, as: 'layoutSeat', attributes: ['seat_number', 'seat_type', 'seat_position'],required: false }],
                order: [['seat_number', 'ASC']]
            });
            console.log('Seats found:', seats.length);
            return seats;
        } catch (error) {
            throw error;
        }
    }

    async reserveSeats(seatIds) {
        try {
            const result = await Seat.update(
                { seat_status: 'booked' },
                {
                    where: {
                        id: seatIds,
                        seat_status: 'available'
                    }
                }
            )
            return result[0] // số hàng bị ảnh hưởng
        } catch (error) {
            throw error;
        }
    }

    async getSeatsByIds(seatIds) {
        try {
            const seats = await Seat.findAll({
                where: {
                    id: seatIds
                },
                include: [{ model: AirplaneSeatLayout, as: 'layoutSeat', attributes: ['seat_number', 'seat_type', 'seat_position'] }],
            })
            return seats;
        } catch (error) {
            throw error;
        }
    }

    async checkSeatsAvailability(seatIds) {
        try {
            const availableSeats = await Seat.findAll({
                where: {
                    id: seatIds,
                    seat_status: 'available'
                }
            });
            return availableSeats.length === seatIds.length;
        } catch (error) {
            throw error;
        }
    }



}

module.exports = SeatRepository;



