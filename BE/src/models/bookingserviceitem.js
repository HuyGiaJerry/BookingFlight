'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BookingServiceItem extends Model {
    
    static associate(models) {
      // BookingServiceItem belongs to Booking
      BookingServiceItem.belongsTo(models.Booking, {foreignKey: 'booking_id',as: 'booking'});

      // BookingServiceItem belongs to BookingFlight
      BookingServiceItem.belongsTo(models.BookingFlight, {foreignKey: 'booking_flight_id',as: 'bookingFlight'});

      // BookingServiceItem belongs to BookingPassenger
      BookingServiceItem.belongsTo(models.BookingPassenger, {foreignKey: 'booking_passenger_id',as: 'bookingPassenger'});

      // BookingServiceItem belongs to Ticket
      BookingServiceItem.belongsTo(models.Ticket, {foreignKey: 'ticket_id',as: 'ticket'});

      // BookingServiceItem belongs to FlightServiceOffer
      BookingServiceItem.belongsTo(models.FlightServiceOffer, {foreignKey: 'flight_service_offer_id',as: 'flightServiceOffer'});
      
      // BookingServiceItem belongs to ServiceOption
      BookingServiceItem.belongsTo(models.ServiceOption, {foreignKey: 'service_option_id',as: 'serviceOption'});
    }
  }
  BookingServiceItem.init({
    booking_id: DataTypes.INTEGER,
    booking_flight_id: DataTypes.INTEGER,
    booking_passenger_id: DataTypes.INTEGER,
    ticket_id: DataTypes.INTEGER,
    flight_service_offer_id: DataTypes.INTEGER,
    service_option_id: DataTypes.INTEGER,
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    unit_price: DataTypes.DOUBLE(10,2),
    total_price: DataTypes.DOUBLE(10,2),
    meta: DataTypes.JSON,
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'purchased'
    }
  }, {
    sequelize,
    modelName: 'BookingServiceItem',
    tableName: 'BookingServiceItems'
  });
  return BookingServiceItem;
};