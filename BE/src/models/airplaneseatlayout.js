'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AirplaneSeatLayout extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 1 AirplaneSeatLayout thuộc về 1 Airplane
      AirplaneSeatLayout.belongsTo(models.Airplane, { foreignKey: 'airplane_id', as: 'airplane' });

      // 1 AirplaneSeatLayout có nhiều có nhiều Seat
      AirplaneSeatLayout.hasMany(models.Seat, { foreignKey: 'layout_seat_id', as: 'seats' });

    }
  }
  AirplaneSeatLayout.init({
    airplane_id: DataTypes.INTEGER,
    seat_number: DataTypes.STRING,
    seat_type: DataTypes.STRING,
    seat_position: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'AirplaneSeatLayout',
  });
  return AirplaneSeatLayout;
};