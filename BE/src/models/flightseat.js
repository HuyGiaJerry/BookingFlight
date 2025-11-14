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
      FlightSeat.belongsTo(models.SeatLayout, { foreignKey: 'seat_layout_id', as: 'seatLayout' });
    }
  }
  FlightSeat.init({
    flight_schedule_id: DataTypes.INTEGER,
    seat_layout_id: DataTypes.INTEGER,
    price_adjustment: DataTypes.DECIMAL(10, 2),
    blocked_by_session_id: DataTypes.STRING,
    booked_at: DataTypes.DATE,
    booked_until: DataTypes.DATE,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'FlightSeat',
  });
  return FlightSeat;
};