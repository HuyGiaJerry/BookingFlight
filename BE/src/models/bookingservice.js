'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BookingService extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // BookingService belongs to Booking
      BookingService.belongsTo(models.Booking, { foreignKey: 'booking_id', as: 'booking' });

      // BookingService belongs to FlightSchedule
      BookingService.belongsTo(models.FlightSchedule, { foreignKey: 'flight_schedule_id', as: 'flightSchedule' });

      // BookingService belongs to ExtraService
      BookingService.belongsTo(models.ExtraService, { foreignKey: 'service_id', as: 'extraService' });

    }
  }
  BookingService.init({
    booking_id: DataTypes.INTEGER,
    flight_schedule_id: DataTypes.INTEGER,
    service_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'BookingService',
  });
  return BookingService;
};