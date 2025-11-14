'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Flight extends Model {

    static associate(models) {
      // 1 Flight belongs to 1 Airline
      Flight.belongsTo(models.Airline, { foreignKey: 'airline_id', as: 'airline' });

      // 1 Flight departs from 1 Airport
      Flight.belongsTo(models.Airport, { foreignKey: 'departure_airport_id', as: 'departureAirport' });

      // 1 Flight arrives at 1 Airport
      Flight.belongsTo(models.Airport, { foreignKey: 'arrival_airport_id', as: 'arrivalAirport' });

      // 1 Flight has many FlightSchedules
      Flight.hasMany(models.FlightSchedule, { foreignKey: 'flight_id', as: 'flightSchedules' });
    }
  }
  Flight.init({
    airline_id: DataTypes.INTEGER,
    flight_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Flight number cannot be empty"
        }
      }
    },
    departure_airport_id: DataTypes.INTEGER,
    arrival_airport_id: DataTypes.INTEGER,
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: "Duration must be an integer"
        },
        min: {
          args: [1],
          msg: "Duration must be at least 1 minute"
        },
        notNull: {
          msg: "Duration is required"
        }
      }
    },
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Flight',
  });
  return Flight;
};