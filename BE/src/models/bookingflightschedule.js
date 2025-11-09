'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BookingFlightSchedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // BookingFlightSchedule belongs to Booking
      BookingFlightSchedule.belongsTo(models.Booking, {foreignKey: 'booking_id',as: 'booking'});

      // BookingFlightSchedule belongs to FlightSchedule
      BookingFlightSchedule.belongsTo(models.FlightSchedule, {foreignKey: 'flight_schedule_id',as: 'flightSchedule'});
    }
  }
  BookingFlightSchedule.init({
    booking_id: DataTypes.INTEGER,
    flight_schedule_id: DataTypes.INTEGER,
    flight_type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'BookingFlightSchedule',
  });
  return BookingFlightSchedule;
};