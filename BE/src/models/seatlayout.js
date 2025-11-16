'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SeatLayout extends Model {

    static associate(models) {
      // 1 SeatLayout belongs to 1 Airplane
      SeatLayout.belongsTo(models.Airplane, { foreignKey: 'airplane_id', as: 'airplane' });

      // 1 SeatLayout belongs to 1 SeatClass
      SeatLayout.belongsTo(models.SeatClass, { foreignKey: 'seat_class_id', as: 'seatClass' });

      // 1 SeatLayout has many FlightSeats
      SeatLayout.hasMany(models.FlightSeat, { foreignKey: 'seat_layout_id', as: 'flightSeats' });
    }
  }
  SeatLayout.init({
    airplane_id: DataTypes.INTEGER,
    seat_class_id: DataTypes.INTEGER,
    seat_number: DataTypes.STRING,
    seat_row: DataTypes.INTEGER,
    seat_column: DataTypes.STRING,
    is_window: DataTypes.BOOLEAN,
    is_aisle: DataTypes.BOOLEAN,
    is_exit_row: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'SeatLayout',
    tableName: 'SeatLayouts',
  });
  return SeatLayout;
};