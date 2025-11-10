'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Passenger extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      // Passenger có nhiều Tickets
      Passenger.hasMany(models.Ticket, { foreignKey: 'passenger_id', as: 'tickets' });

      // Passenger có nhiều BookingServices
      Passenger.hasMany(models.BookingService, { foreignKey: 'passenger_id', as: 'bookingServices' });
    }
  }
  Passenger.init({
    fullname: DataTypes.STRING,
    dob: DataTypes.DATE,
    passenger_type: DataTypes.STRING,
    nationality: DataTypes.STRING,
    passport_number: DataTypes.STRING,
    passport_expiry: DataTypes.DATE,
    gender: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Passenger',
  });
  return Passenger;
};