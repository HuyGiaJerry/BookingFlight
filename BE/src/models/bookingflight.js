'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BookingFlight extends Model {
    
    static associate(models) {
      // BookingFlight belongs to 1 Booking
      BookingFlight.belongsTo(models.Booking, { foreignKey: 'booking_id', as: 'booking' });

      // BookingFlight belongs to 1 FlightSchedule
      BookingFlight.belongsTo(models.FlightSchedule, { foreignKey: 'flight_schedule_id', as: 'flightSchedule' } );

      // 1 BookingFlight - n Tickets
      BookingFlight.hasMany(models.Ticket, { foreignKey: 'booking_flight_id', as: 'tickets' } );

      // 1 BookingFlight - n BookingServiceItems
      BookingFlight.hasMany(models.BookingServiceItem, { foreignKey: 'booking_flight_id', as: 'bookingServiceItems' } );
    }
  }
  BookingFlight.init({
    booking_id: DataTypes.INTEGER,
    flight_schedule_id: DataTypes.INTEGER,
    flight_type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'BookingFlight',
    tableName: 'BookingFlights',
  });
  return BookingFlight;
};