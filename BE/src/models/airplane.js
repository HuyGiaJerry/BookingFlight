'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Airplane extends Model {

    static associate(models) {
      // Airplane belongs to an Airline
      Airplane.belongsTo(models.Airline, { foreignKey: 'airline_id', as: 'airline' });

      // Airplane has many FlightSchedules
      Airplane.hasMany(models.FlightSchedule, { foreignKey: 'airplane_id', as: 'flightSchedules' });

      // Airplane has many SeatLayouts
      Airplane.hasMany(models.SeatLayout, { foreignKey: 'airplane_id', as: 'seatLayouts' });
    }
  }
  Airplane.init({
    airline_id: DataTypes.INTEGER,

    registration_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Registration number cannot be empty"
        }
      }
    },

    model: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Model cannot be empty"
        }
      }
    },

    total_seats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: "Total seats must be an integer"
        },
        min: {
          args: [1],
          msg: "Total seats must be at least 1"
        },
        notNull: {
          msg: "Total seats is required"
        }
      }
    },
  }, {
    sequelize,
    modelName: 'Airplane',
    tableName: 'Airplanes',
  });
  return Airplane;
};