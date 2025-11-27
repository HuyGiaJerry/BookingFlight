'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BookingPassenger extends Model {

    static associate(models) {
      // BookingPassenger belongs to Booking
      BookingPassenger.belongsTo(models.Booking, { foreignKey: 'booking_id', as: 'booking' });
      // BookingPassenger belongs to Passenger
      BookingPassenger.belongsTo(models.Passenger, { foreignKey: 'passenger_id', as: 'passenger' });
      // BookingPassenger has many BookingServiceItems
      BookingPassenger.hasMany(models.BookingServiceItem, { foreignKey: 'booking_passenger_id', as: 'bookingServiceItems' });
    }
  }
  BookingPassenger.init({
    booking_id: DataTypes.INTEGER,
    passenger_id: DataTypes.INTEGER,
    fullname: DataTypes.STRING,
    gender: DataTypes.STRING,
    date_of_birth: DataTypes.DATE,
    nationality: DataTypes.STRING,
    passenger_type: DataTypes.STRING,
    passport_number: DataTypes.STRING,
    passport_expiry: DataTypes.DATE,
    id_card_number: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'BookingPassenger',
    tableName: 'BookingPassengers',
  });
  return BookingPassenger;
};