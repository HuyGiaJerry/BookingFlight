const CrudRepository = require('./crud-repository');
const { Seat, AirplaneSeatLayout ,sequelize} = require('../models');
const { where ,op } = require('sequelize');

class SeatRepository extends CrudRepository {
    constructor() {
        super(Seat);
    }

    // Tìm các ghế theo flight_schedule_id
    async findByScheduleId(flightScheduleId) {
        return Seat.findAll({
            where: { flight_schedule_id: flightScheduleId },
            include: [{ model: AirplaneSeatLayout, as: 'seatLayout' }],
        })
    }

    // lock ghế khi đang trong quá trình đặt
    async lockSeatById(seatId, transaction) {
        return Seat.findOne({
            where: { id: seatId },
            transaction,
            lock: transaction.LOCK.UPDATE
        })
    }

    // Cập nhật trạng thái ghế
    async update(seatId, data, transaction) {
        return Seat.update(data, {
            where: { id: seatId },
            transaction
        })
    }

    async createForSchedule(layoutId, flightScheduleId, priceOverride = null) {
        return Seat.create({
            layout_id: layoutId,
            flight_schedule_id: flightScheduleId,
            price_override: priceOverride,
            seat_status: 'available'
        })
    }
}

module.exports = SeatRepository;



