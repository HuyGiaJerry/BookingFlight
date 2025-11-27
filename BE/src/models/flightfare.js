'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FlightFare extends Model {

    static associate(models) {
      // 1 FlightFare belongs to 1 FlightSchedule
      FlightFare.belongsTo(models.FlightSchedule, { foreignKey: 'flight_schedule_id', as: 'flightSchedule' });

      // 1 FlightFare belongs to 1 SeatClass
      FlightFare.belongsTo(models.SeatClass, { foreignKey: 'seat_class_id', as: 'seatClass' });
    }
  }
  FlightFare.init({
    flight_schedule_id: DataTypes.INTEGER,
    seat_class_id: DataTypes.INTEGER,
    base_price: DataTypes.DECIMAL(10, 2),
    tax: DataTypes.DECIMAL(10, 2),
    service_fee: DataTypes.DECIMAL(10, 2),
    total_seats_allocated: DataTypes.INTEGER,
    seats_booked: DataTypes.INTEGER,
    seats_available: DataTypes.INTEGER,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'FlightFare',
    tableName: 'FlightFares',
  });
  return FlightFare;
};