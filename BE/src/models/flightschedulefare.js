'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FlightScheduleFare extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // FlightScheduleFare belongs to FlightSchedule
      FlightScheduleFare.belongsTo(models.FlightSchedule, {foreignKey: 'flight_schedule_id',as: 'flightSchedule'});
      
      // FlightScheduleFare has many Tickets
      FlightScheduleFare.hasMany(models.Ticket, { foreignKey: 'fare_id', as: 'tickets' });

    }
  }
  FlightScheduleFare.init({
    flight_schedule_id: DataTypes.INTEGER,
    class_type: DataTypes.STRING,
    price: DataTypes.DOUBLE,
    seat_allocated: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'FlightScheduleFare',
  });
  return FlightScheduleFare;
};