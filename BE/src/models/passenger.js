'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Passenger extends Model {

    static associate(models) {
      // Passenger belongs to 1 Account
      Passenger.belongsTo(models.Account, { foreignKey: 'account_id', as: 'account' });

      // 1 Passenger - n BookingPassengers
      Passenger.hasMany(models.BookingPassenger, { foreignKey: 'passenger_id', as: 'bookingPassengers' });
    }
  }
  Passenger.init({
    account_id: DataTypes.INTEGER,
    fullname: DataTypes.STRING,
    date_of_birth: DataTypes.DATE,
    gender: DataTypes.STRING,
    passenger_type: DataTypes.STRING,
    nationality: DataTypes.STRING,
    passport_number: DataTypes.STRING,
    passport_expiry: DataTypes.DATE,
    id_card_number: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Passenger',
    tableName: 'Passengers',
  });
  return Passenger;
};