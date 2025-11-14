'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SeatClass extends Model {
    
    static associate(models) {
      // 1 SeatClass has many FlightFares
      SeatClass.hasMany(models.FlightFare, { foreignKey: 'seat_class_id', as: 'flightFares' });

      // 1 SeatClass has many SeatLayouts
      SeatClass.hasMany(models.SeatLayout, { foreignKey: 'seat_class_id', as: 'seatLayouts' });
    }
  }
  SeatClass.init({
    class_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Class name cannot be empty"
        }
      }
    },
    class_code: DataTypes.STRING,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'SeatClass',
  });
  return SeatClass;
};