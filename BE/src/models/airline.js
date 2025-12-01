'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Airline extends Model {

    static associate(models) {
      // 1 Airline has many Airplanes
      Airline.hasMany(models.Airplane, { foreignKey: 'airline_id', as: 'airplanes' });

      // 1 Airline has many Flights
      Airline.hasMany(models.Flight, { foreignKey: 'airline_id', as: 'flights' });
    }
  }
  Airline.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Airline name cannot be empty"
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

    logo_url: DataTypes.STRING ,
    logo_public_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Airline',
    tableName: 'Airlines',
  });
  return Airline;
};