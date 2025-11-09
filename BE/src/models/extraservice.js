'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExtraService extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // ExtraService có nhiều BookingServices
      ExtraService.hasMany(models.BookingService, { foreignKey: 'service_id', as: 'bookingServices' });
    }
  }
  ExtraService.init({
    service_type: DataTypes.STRING,
    price: DataTypes.DOUBLE,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ExtraService',
  });
  return ExtraService;
};