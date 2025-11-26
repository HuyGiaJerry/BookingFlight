const CrudRepository = require('./crud-repository');
const { FlightSeat, SeatLayout, SeatClass, FlightSchedule, Airplane, Ticket } = require('../models');
const { Op, Sequelize } = require('sequelize');

class SeatRepository extends CrudRepository {
    constructor() {
        super(FlightSeat);
    }


    // Get airplane seat layout with availability for specific flight
    async getFlightSeatMap(flightScheduleId) {
        try {
            const flightSchedule = await FlightSchedule.findByPk(flightScheduleId, {
                include: [
                    {
                        model: Airplane,
                        as: 'airplane',
                        attributes: ['id', 'model', 'total_seats']
                    }
                ]
            });

            if (!flightSchedule) {
                throw new Error('Flight schedule not found');
            }

            // Get seat layout for this airplane
            const seatLayouts = await SeatLayout.findAll({
                where: { airplane_id: flightSchedule.airplane_id },
                include: [
                    {
                        model: SeatClass,
                        as: 'seatClass',
                        attributes: ['id', 'class_name', 'class_code']
                    }
                ],
                order: [['seat_row', 'ASC'], ['seat_column', 'ASC']]
            });

            // Get flight seats status
            const flightSeats = await FlightSeat.findAll({
                where: { flight_schedule_id: flightScheduleId },
                include: [
                    {
                        model: SeatLayout,
                        as: 'seatLayout',
                        attributes: ['seat_number', 'seat_row', 'seat_column']
                    }
                ]
            });

            // Create seat map with availability
            const seatMap = seatLayouts.map(layout => {
                const flightSeat = flightSeats.find(fs => fs.seat_layout_id === layout.id);

                return {
                    seat_id: flightSeat?.id || null,
                    seat_number: layout.seat_number,
                    seat_row: layout.seat_row,
                    seat_column: layout.seat_column,
                    seat_class: layout.seatClass,
                    is_window: layout.is_window,
                    is_aisle: layout.is_aisle,
                    is_exit_row: layout.is_exit_row,
                    price_adjustment: flightSeat?.price_adjustment || 0,
                    status: flightSeat?.status || 'available',
                    is_blocked: flightSeat?.blocked_until && new Date(flightSeat.blocked_until) > new Date(),
                    blocked_session_id: flightSeat?.blocked_session_id || null
                };
            });

            return {
                flight_schedule: flightSchedule,
                airplane: flightSchedule.airplane,
                seat_map: seatMap
            };
        } catch (error) {
            console.error('Error getting flight seat map:', error);
            throw error;
        }
    }


    // Block seats for booking session

    async blockSeats(seatIds, sessionId, durationMinutes = 15) {
        try {
            const blockedUntil = new Date(Date.now() + durationMinutes * 60000);

            const [updatedRows] = await FlightSeat.update({
                status: 'blocked',
                blocked_session_id: sessionId,
                blocked_at: new Date(),
                blocked_until: blockedUntil
            }, {
                where: {
                    id: { [Op.in]: seatIds },
                    status: 'available'
                }
            });

            return updatedRows;
        } catch (error) {
            console.error('Error blocking seats:', error);
            throw error;
        }
    }

    // Release blocked seats
    async releaseBlockedSeats(sessionId) {
        try {
            const [updatedRows] = await FlightSeat.update({
                status: 'available',
                blocked_session_id: null,
                blocked_at: null,
                blocked_until: null
            }, {
                where: {
                    blocked_session_id: sessionId,
                    status: 'blocked'
                }
            });

            return updatedRows;
        } catch (error) {
            console.error('Error releasing blocked seats:', error);
            throw error;
        }
    }


    // Book seats (mark as booked)
    async bookSeats(seatIds, sessionId) {
        try {
            const [updatedRows] = await FlightSeat.update({
                status: 'booked',
                booked_at: new Date(),
                blocked_session_id: null,
                blocked_at: null,
                blocked_until: null
            }, {
                where: {
                    id: { [Op.in]: seatIds },
                    blocked_session_id: sessionId,
                    status: 'blocked'
                }
            });

            return updatedRows;
        } catch (error) {
            console.error('Error booking seats:', error);
            throw error;
        }
    }


    // Clean expired blocked seats
    async cleanExpiredBlocks() {
        try {
            const [updatedRows] = await FlightSeat.update({
                status: 'available',
                blocked_session_id: null,
                blocked_at: null,
                blocked_until: null
            }, {
                where: {
                    status: 'blocked',
                    blocked_until: { [Op.lt]: new Date() }
                }
            });

            console.log(`Cleaned ${updatedRows} expired seat blocks`);
            return updatedRows;
        } catch (error) {
            console.error('Error cleaning expired blocks:', error);
            throw error;
        }
    }


    // Get available seats for specific class
    async getAvailableSeatsForClass(flightScheduleId, seatClassId) {
        try {
            return await FlightSeat.findAll({
                where: {
                    flight_schedule_id: flightScheduleId,
                    status: 'available'
                },
                include: [
                    {
                        model: SeatLayout,
                        as: 'seatLayout',
                        where: { seat_class_id: seatClassId },
                        include: [
                            {
                                model: SeatClass,
                                as: 'seatClass',
                                attributes: ['class_name', 'class_code']
                            }
                        ]
                    }
                ]
            });
        } catch (error) {
            console.error('Error getting available seats for class:', error);
            throw error;
        }
    }

    // Check seat availability
    async checkSeatAvailability(seatIds) {
        try {
            const seats = await FlightSeat.findAll({
                where: { id: { [Op.in]: seatIds } },
                include: [
                    {
                        model: SeatLayout,
                        as: 'seatLayout',
                        attributes: ['seat_number']
                    }
                ]
            });

            return seats.map(seat => ({
                seat_id: seat.id,
                seat_number: seat.seatLayout.seat_number,
                status: seat.status,
                is_available: seat.status === 'available',
                is_blocked: seat.status === 'blocked' &&
                    seat.blocked_until &&
                    new Date(seat.blocked_until) > new Date(),
                blocked_until: seat.blocked_until
            }));
        } catch (error) {
            console.error('Error checking seat availability:', error);
            throw error;
        }
    }

    // Thêm method này vào cuối class SeatRepository:

    /**
     * 🗑️ Release specific seat for passenger
     */
    async releaseSpecificSeat(flightSeatId, sessionId) {
        try {
            const [updatedRows] = await FlightSeat.update({
                status: 'available',
                blocked_session_id: null,
                blocked_at: null,
                blocked_until: null
            }, {
                where: {
                    id: flightSeatId,
                    blocked_session_id: sessionId,
                    status: 'blocked'
                }
            });

            return updatedRows;
        } catch (error) {
            console.error('Error releasing specific seat:', error);
            throw error;
        }
    }
}

module.exports = SeatRepository;