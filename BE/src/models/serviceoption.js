'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ServiceOption extends Model {
    
    static associate(models) {
      // ServiceOption belongs to ServiceCatalog
      ServiceOption.belongsTo(models.ServiceCatalog, {foreignKey: 'catalog_id',as: 'catalog'});

      // ServiceOption has many FlightServiceOffers
      ServiceOption.hasMany(models.FlightServiceOffer, {foreignKey: 'service_option_id',as: 'flightServiceOffers'});

      // ServiceOption has many BookingServiceItems
      ServiceOption.hasMany(models.BookingServiceItem, {foreignKey: 'service_option_id',as: 'bookingServiceItems'});
    }
  }
  ServiceOption.init({
    catalog_id: DataTypes.INTEGER,
    code: DataTypes.STRING(100),
    title: DataTypes.STRING(200),
    description: DataTypes.STRING(500),
    price: DataTypes.DOUBLE(10,2),
    extra_meta: DataTypes.JSON,
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'ServiceOption',
    tableName: 'ServiceOptions'
  });
  return ServiceOption;
};