'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Airport extends Model {

    static associate(models) {
      // 1 Airport has many departure Flights
      Airport.hasMany(models.Flight, { foreignKey: 'departure_airport_id', as: 'departureFlights' });

      // 1 Airport has many arrival Flights
      Airport.hasMany(models.Flight, { foreignKey: 'arrival_airport_id', as: 'arrivalFlights' } );
    }
  }
  Airport.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Airport name cannot be empty"
        }
      }
    },
    iata_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "IATA code cannot be empty"
        }
      }
    },

    city: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "City cannot be empty"
        }
      }
    },

    country: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Country cannot be empty"
        }
      }
    },

    timezone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Timezone cannot be empty"
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Airport',
    tableName: 'Airports'
  });
  return Airport;
};