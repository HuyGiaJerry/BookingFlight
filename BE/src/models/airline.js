'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Airline extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 1 Airline có nhiều Airplane
      Airline.hasMany(models.Airplane, { foreignKey: 'airline_id', as: 'airplanes' });
    }
  }
  Airline.init({
    name: DataTypes.STRING,
    logo_url: DataTypes.STRING,
    code: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Airline',
  });
  return Airline;
};