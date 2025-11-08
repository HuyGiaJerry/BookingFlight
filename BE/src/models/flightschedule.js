'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FlightSchedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 1 FlightSchedule thuộc về 1 Flight
      FlightSchedule.belongsTo(models.Flight, { foreignKey: 'flight_id', as: 'flight' });

      // 1 FlightSchedule có nhiều Seats
      FlightSchedule.hasMany(models.Seat, { foreignKey: 'flight_schedule_id', as: 'seats' });

      // 1 FlightSchedule có nhiều FlightScheduleFares
      FlightSchedule.hasMany(models.FlightScheduleFare, { foreignKey: 'flight_schedule_id', as: 'fares' });
    }
  }
  FlightSchedule.init({
    flight_id: DataTypes.INTEGER,
    departure_time: DataTypes.DATE,
    arrival_time: DataTypes.DATE,
    price: DataTypes.DOUBLE,
    available_seat: DataTypes.INTEGER,
    flight_schedule_status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'FlightSchedule',
  });
  return FlightSchedule;
};