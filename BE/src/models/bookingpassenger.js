'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BookingPassenger extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // BookingPassenger belongs to Booking
      BookingPassenger.belongsTo(models.Booking, { foreignKey: 'booking_id' , as: 'booking' });
      
      // BookingPassenger belongs to Passenger
      BookingPassenger.belongsTo(models.Passenger, { foreignKey: 'passenger_id' , as: 'passenger' });
    }
  }
  BookingPassenger.init({
    booking_id: DataTypes.INTEGER,
    passenger_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'BookingPassenger',
  });
  return BookingPassenger;
};