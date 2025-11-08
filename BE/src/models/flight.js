'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Flight extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 1 Flight có nhiều FlightSchedule
      Flight.hasMany(models.FlightSchedule, { foreignKey: 'flight_id', as: 'schedules' });

      // Flight thuộc về 1 Airport (departure)
      Flight.belongsTo(models.Airport, { foreignKey: 'departure_airport_id', as: 'departureAirport' });
      // Flight thuộc về 1 Airport (arrival)
      Flight.belongsTo(models.Airport, { foreignKey: 'arrival_airport_id', as: 'arrivalAirport' });

      // 1 Flight thuộc về 1 Airplane
      Flight.belongsTo(models.Airplane, { foreignKey: 'airplane_id', as: 'airplane' });
    }
  }
  Flight.init({
    flight_number: DataTypes.STRING,
    departure_airport_id: DataTypes.INTEGER,
    arrival_airport_id: DataTypes.INTEGER,
    airplane_id: DataTypes.INTEGER,
    duration: DataTypes.INTEGER,
    base_price: DataTypes.DOUBLE,
    flight_status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Flight',
  });
  return Flight;
};