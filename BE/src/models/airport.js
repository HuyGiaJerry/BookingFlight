'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Airport extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 1 Airport có nhiều Flight (departure)
      Airport.hasMany(models.Flight, { foreignKey: 'departure_airport_id', as: 'departingFlights' });
      // 1 Airport có nhiều Flight (arrival)
      Airport.hasMany(models.Flight, { foreignKey: 'arrival_airport_id', as: 'arrivingFlights' });
    }
  }
  Airport.init({
    name: DataTypes.STRING,
    logo_url: DataTypes.STRING,
    iata_code: DataTypes.STRING,
    city: DataTypes.STRING,
    country: DataTypes.STRING,
    timezone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Airport',
  });
  return Airport;
};