const CrudRepository = require('./crud-repository');
const { FlightSeat, SeatLayout, SeatClass, FlightSchedule, Airplane, Ticket } = require('../models');
const { Op, Sequelize, where } = require('sequelize');

class SeatRepository extends CrudRepository {
    constructor() {
        super(FlightSeat);
    }

    // ✅ UPDATED: Get airplane seat layout with class filter
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

            // ✅ Build where condition cho SeatLayout
            const seatLayoutWhere = {
                airplane_id: flightSchedule.airplane_id
            };

            // Get seat layout for this airplane (filtered by class if provided)
            const seatLayouts = await SeatLayout.findAll({
                where: seatLayoutWhere,
                include: [
                    {
                        model: SeatClass,
                        as: 'seatClass',
                        attributes: ['id', 'class_name', 'class_code'],
                    }
                ],
                order: [['seat_row', 'ASC'], ['seat_column', 'ASC']]
            });

            if (seatLayouts.length === 0) {
                console.log(`No seat layouts found for airplane ${flightSchedule.airplane_id}${seatClassId ? ` and class ${seatClassId}` : ''}`);
                return {
                    flight_schedule: flightSchedule,
                    airplane: flightSchedule.airplane,
                    seat_map: []
                };
            }

            // ✅ Get flight seats status (chỉ lấy những ghế thuộc layout đã filter)
            const seatLayoutIds = seatLayouts.map(layout => layout.id);

            const flightSeats = await FlightSeat.findAll({
                where: {
                    flight_schedule_id: flightScheduleId,
                    seat_layout_id: { [Op.in]: seatLayoutIds } // ✅ QUAN TRỌNG: Chỉ lấy seat thuộc layout đã filter
                },
                include: [
                    {
                        model: SeatLayout,
                        as: 'seatLayout',
                        attributes: ['seat_number', 'seat_row', 'seat_column', 'seat_class_id']
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
                    seat_class: {
                        id: layout.seatClass.id,
                        class_name: layout.seatClass.class_name.toUpperCase(),
                        class_code: layout.seatClass.class_code.toUpperCase()
                    },
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

    // ✅ NEW: Get seats by specific class only
    async getFlightSeatsByClass(flightScheduleId, seatClassId) {
        try {
            return await this.getFlightSeatMap(flightScheduleId, seatClassId);
        } catch (error) {
            console.error('Error getting seats by class:', error);
            throw error;
        }
    }

    // ✅ UPDATED: Get available seats for specific class (tối ưu hơn)
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
                        where: { seat_class_id: seatClassId }, // ✅ Filter by class
                        include: [
                            {
                                model: SeatClass,
                                as: 'seatClass',
                                attributes: ['class_name', 'class_code']
                            }
                        ]
                    }
                ],
                order: [
                    [{ model: SeatLayout, as: 'seatLayout' }, 'seat_row', 'ASC'],
                    [{ model: SeatLayout, as: 'seatLayout' }, 'seat_column', 'ASC']
                ]
            });
        } catch (error) {
            console.error('Error getting available seats for class:', error);
            throw error;
        }
    }

    // ✅ NEW: Get seat count summary by class for a flight
    async getSeatCountByClass(flightScheduleId) {
        try {
            const result = await FlightSeat.findAll({
                attributes: [
                    [Sequelize.literal('seatLayout.seat_class_id'), 'class_id'],
                    [Sequelize.literal('seatClass.class_name'), 'class_name'],
                    [Sequelize.literal('seatClass.class_code'), 'class_code'],
                    [Sequelize.fn('COUNT', Sequelize.col('FlightSeat.id')), 'total_seats'],
                    [Sequelize.fn('SUM',
                        Sequelize.literal('CASE WHEN status = "available" THEN 1 ELSE 0 END')
                    ), 'available_seats'],
                    [Sequelize.fn('SUM',
                        Sequelize.literal('CASE WHEN status = "booked" THEN 1 ELSE 0 END')
                    ), 'booked_seats']
                ],
                where: {
                    flight_schedule_id: flightScheduleId
                },
                include: [
                    {
                        model: SeatLayout,
                        as: 'seatLayout',
                        attributes: [],
                        include: [
                            {
                                model: SeatClass,
                                as: 'seatClass',
                                attributes: []
                            }
                        ]
                    }
                ],
                group: [
                    'seatLayout.seat_class_id',
                    'seatClass.class_name',
                    'seatClass.class_code'
                ],
                raw: true
            });

            return result.map(row => ({
                class_id: row.class_id,
                class_name: row.class_name,
                class_code: row.class_code,
                total_seats: parseInt(row.total_seats),
                available_seats: parseInt(row.available_seats),
                booked_seats: parseInt(row.booked_seats)
            }));
        } catch (error) {
            console.error('Error getting seat count by class:', error);
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


    // Check seat availability
    async checkSeatAvailability(seatIds) {
        try {
            const seats = await FlightSeat.findAll({
                where: { id: { [Op.in]: seatIds } },
                include: [
                    {
                        model: SeatLayout,
                        as: 'seatLayout',
                        attributes: ['seat_number', 'seat_class_id'],
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

            return seats.map(seat => {
                const now = new Date();
                const isBlockedAndValid =
                    seat.status === 'blocked' &&
                    seat.blocked_until &&
                    new Date(seat.blocked_until) > now;

                const isAvailable =
                    seat.status === 'available' ||
                    (seat.status === 'blocked' &&
                        seat.blocked_until &&
                        new Date(seat.blocked_until) <= now);

                return {
                    seat_id: seat.id,
                    seat_number: seat.seatLayout.seat_number,
                    seat_class: seat.seatLayout.seatClass,
                    status: seat.status,
                    is_available: isAvailable,
                    is_blocked: isBlockedAndValid,
                    blocked_until: seat.blocked_until
                };
            });
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