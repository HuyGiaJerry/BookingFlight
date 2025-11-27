'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FlightSeat extends Model {
    
    static associate(models) {
      // 1 FlightSeat belongs to 1 FlightSchedule
      FlightSeat.belongsTo(models.FlightSchedule, { foreignKey: 'flight_schedule_id', as: 'flightSchedule' });

      // 1 FlightSeat belongs to 1 SeatLayout
      FlightSeat.belongsTo(models.SeatLayout, { foreignKey: 'seat_layout_id',  as: 'seatLayout' });

      // 1 FlightSeat - 1 Ticket
      FlightSeat.hasOne(models.Ticket, { foreignKey: 'flight_seat_id', as: 'ticket' });
    }
  }
  
  FlightSeat.init({
    flight_schedule_id: DataTypes.INTEGER,
    seat_layout_id: DataTypes.INTEGER,
    price_adjustment: DataTypes.DECIMAL(10, 2),
    blocked_session_id: DataTypes.STRING,    // ✅ SỬA: blocked_session_id
    blocked_at: DataTypes.DATE,              // ✅ SỬA: blocked_at
    blocked_until: DataTypes.DATE,           // ✅ SỬA: blocked_until
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'FlightSeat',
    tableName: 'FlightSeats',
  });
  
  return FlightSeat;
};