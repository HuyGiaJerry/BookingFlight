'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Airplane extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 1 Airplane thuộc về 1 Airline
      Airplane.belongsTo(models.Airline, { foreignKey: 'airline_id', as: 'airline' });

      // 1 Airplane có nhiều Flight
      Airplane.hasMany(models.Flight, { foreignKey: 'airplane_id', as: 'flights' });

      // 1 Airplane có nhiều AirplaneSeatLayout
      Airplane.hasMany(models.AirplaneSeatLayout, { foreignKey: 'airplane_id', as: 'seatLayouts' });
    }
  }
  Airplane.init({
    model: DataTypes.STRING,
    airline_id: DataTypes.INTEGER,
    seat_capacity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Airplane',
  });
  return Airplane;
};