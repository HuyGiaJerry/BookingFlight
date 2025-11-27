'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    
    static associate(models) {
      // Ticket belongs to Booking
      Ticket.belongsTo(models.Booking, {foreignKey: 'booking_id',as: 'booking'});

      // Ticket belongs to BookingFlight
      Ticket.belongsTo(models.BookingFlight, {foreignKey: 'booking_flight_id',as: 'bookingFlight'});

      // Ticket belongs to Passenger
      Ticket.belongsTo(models.Passenger, {foreignKey: 'passenger_id',as: 'passenger'});

      // Ticket belongs to FlightSeat
      Ticket.belongsTo(models.FlightSeat, {foreignKey: 'flight_seat_id',as: 'flightSeat'});

      // Ticket belongs to SeatClass
      Ticket.belongsTo(models.SeatClass, {foreignKey: 'seat_class_id',as: 'seatClass'});

      // Ticket has many BookingServiceItems
      Ticket.hasMany(models.BookingServiceItem, {foreignKey: 'ticket_id',as: 'bookingServiceItems'});
    }
  }
  Ticket.init({
    ticket_number: DataTypes.STRING,
    booking_id: DataTypes.INTEGER,
    booking_flight_id: DataTypes.INTEGER,
    booking_passenger_id: DataTypes.INTEGER,
    flight_seat_id: DataTypes.INTEGER,
    seat_number: DataTypes.STRING,
    seat_class_id: DataTypes.INTEGER,
    base_fare: DataTypes.DECIMAL(10,2),
    seat_adjustment: DataTypes.DECIMAL(10,2),
    tax: DataTypes.DECIMAL(10,2),
    service_fee: DataTypes.DECIMAL(10,2),
    total_amount: DataTypes.DECIMAL(10,2),
    status: DataTypes.STRING,
    issued_at: DataTypes.DATE,
    checked_in_at: DataTypes.DATE,
    cancelled_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Ticket',
    tableName: 'Tickets'
  });
  return Ticket;
};