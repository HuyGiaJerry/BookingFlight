'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ticket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Ticket belongs to Booking
      Ticket.belongsTo(models.Booking, { foreignKey: 'booking_id' , as: 'booking' });

      // Ticket belongs to FlightSchedule
      Ticket.belongsTo(models.FlightSchedule, { foreignKey: 'flight_schedule_id', as: 'flightSchedule' });

      // Ticket belongs to Passenger
      Ticket.belongsTo(models.Passenger, { foreignKey: 'passenger_id',  as: 'passenger' });

      // Ticket belongs to AirplaneLayoutSeat
      Ticket.belongsTo(models.AirplaneLayoutSeat, { foreignKey: 'layout_seat_id', as: 'airplaneSeatLayout' });
    }
  }
  Ticket.init({
    ticket_code: DataTypes.STRING,
    booking_id: DataTypes.INTEGER,
    flight_schedule_id: DataTypes.INTEGER,
    passenger_id: DataTypes.INTEGER,
    layout_seat_id: DataTypes.INTEGER,
    ticket_status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Ticket',
  });
  return Ticket;
};