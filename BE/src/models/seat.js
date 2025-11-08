'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Seat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Seat thuộc về 1 FlightSchedule
      Seat.belongsTo(models.FlightSchedule, { foreignKey: 'flight_schedule_id', as: 'flightSchedule' });

      // Seat thuộc về 1 AirplaneSeatLayout
      Seat.belongsTo(models.AirplaneSeatLayout, { foreignKey: 'layout_id', as: 'seatLayout' } );

    }
  }
  Seat.init({
    flight_schedule_id: DataTypes.INTEGER,
    layout_id: DataTypes.INTEGER,
    price_override: DataTypes.DOUBLE,
    seat_status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Seat',
  });
  return Seat;
};