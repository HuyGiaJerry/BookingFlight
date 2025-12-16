'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    
    static associate(models) {
      // Booking belongs to 1 Account
      Booking.belongsTo(models.Account, { foreignKey: 'account_id', as: 'account' } );

      // Booking has many BookingFlights
      Booking.hasMany(models.BookingFlight, { foreignKey: 'booking_id', as: 'bookingFlights' } );

      // Booking has many Tickets
      Booking.hasMany(models.Ticket, { foreignKey: 'booking_id', as: 'tickets' } );

      // Booking has many BookingPassengers
      Booking.hasMany(models.BookingPassenger, { foreignKey: 'booking_id', as: 'bookingPassengers' } );

      // Booking has many BookingServiceItems
      Booking.hasMany(models.BookingServiceItem, { foreignKey: 'booking_id', as: 'bookingServiceItems' } );

      // Booking has one Payment
      Booking.hasOne(models.Payment, { foreignKey: 'booking_id', as: 'payment' } );
    }
  }
  Booking.init({
    booking_code: DataTypes.STRING,
    account_id: DataTypes.INTEGER,
    contact_email: DataTypes.STRING,
    contact_phone: DataTypes.STRING,
    booking_type: DataTypes.STRING,
    total_amount: DataTypes.DECIMAL(10,2),
    status: DataTypes.STRING,
    payment_status: DataTypes.STRING,
    confirmed_at: DataTypes.DATE,
    expired_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Booking',
    tableName: 'Bookings',
  });
  return Booking;
};