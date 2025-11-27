'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FlightServiceOffer extends Model {
    
    static associate(models) {
      // FlightServiceOffer belongs to FlightSchedule
      FlightServiceOffer.belongsTo(models.FlightSchedule, {foreignKey: 'flight_schedule_id',as: 'flightSchedule'});

      // FlightServiceOffer belongs to ServiceOption
      FlightServiceOffer.belongsTo(models.ServiceOption, {foreignKey: 'service_option_id',as: 'serviceOption'});

      // FlightServiceOffer has many BookingServiceItems
      FlightServiceOffer.hasMany(models.BookingServiceItem, {foreignKey: 'flight_service_offer_id',as: 'bookingServiceItems'});
    }
  }
  FlightServiceOffer.init({
    flight_schedule_id: DataTypes.INTEGER,
    service_option_id: DataTypes.INTEGER,
    price_override: DataTypes.DOUBLE(10,2),
    is_free: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    included_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    capacity: DataTypes.INTEGER,
    sold_count: DataTypes.INTEGER,
    available_from: DataTypes.DATE,
    available_until: DataTypes.DATE,
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'available'
    }
  }, {
    sequelize,
    modelName: 'FlightServiceOffer',
    tableName: 'FlightServiceOffers',
  });
  return FlightServiceOffer;
};