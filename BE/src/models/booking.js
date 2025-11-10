'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Booking thuộc về 1 User
      Booking.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });

      // Booking có nhiều BookingFlightSchedules
      Booking.hasMany(models.BookingFlightSchedule, { foreignKey: 'booking_id', as: 'flightSchedules' });

      // Booking có nhiều BookingServices
      Booking.hasMany(models.BookingService, { foreignKey: 'booking_id', as: 'services' });

      // Booking has one Payment
      Booking.hasOne(models.Payment, { foreignKey: 'booking_id', as: 'payment' });

      // Booking has many Tickets
      Booking.hasMany(models.Ticket, { foreignKey: 'booking_id', as: 'tickets' });
    }
  }
  Booking.init({
    user_id: DataTypes.INTEGER,
    total_price: DataTypes.DOUBLE,
    payment_id: DataTypes.INTEGER,
    booking_status: DataTypes.STRING,
    overall_status: DataTypes.STRING,
    booking_type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};