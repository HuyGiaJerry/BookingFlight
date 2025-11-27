'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FlightSchedule extends Model {
    
    static associate(models) {
      // 1 FlightSchedule belongs to 1 Flight
      FlightSchedule.belongsTo(models.Flight, { foreignKey: 'flight_id', as: 'flight' });

      // 1 FlightSchedule uses 1 Airplane
      FlightSchedule.belongsTo(models.Airplane, { foreignKey: 'airplane_id', as: 'airplane' });

      // 1 FlightSchedule has many FlightFares
      FlightSchedule.hasMany(models.FlightFare, { foreignKey: 'flight_schedule_id', as: 'flightFares' });

      // 1 FlightSchedule has many FlightSeats
      FlightSchedule.hasMany(models.FlightSeat, { foreignKey: 'flight_schedule_id', as: 'flightSeats' });

      // 1 FlightSchedule has many BookingFlights
      FlightSchedule.hasMany(models.BookingFlight, { foreignKey: 'flight_schedule_id', as: 'bookingFlights' } );

      // 1 FlightSchedule has many FlightServiceOffers
      FlightSchedule.hasMany(models.FlightServiceOffer, { foreignKey: 'flight_schedule_id', as: 'flightServiceOffers' } );

    }
  }
  FlightSchedule.init({
    flight_id: DataTypes.INTEGER,
    airplane_id: DataTypes.INTEGER,
    departure_time: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: "Departure time must be a valid date"
        },
        notNull: {
          msg: "Departure time is required"
        }
      }
    },
    arrival_time: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: "Arrival time must be a valid date"
        },
        notNull: {
          msg: "Arrival time is required"
        }
      }
    },
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'FlightSchedule',
    tableName: 'FlightSchedules',
    underscored: false,
    timestamps: true
  });
  return FlightSchedule;
};