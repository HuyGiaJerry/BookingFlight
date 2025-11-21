'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tickets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ticket_number: {
        type: Sequelize.STRING
      },
      booking_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Bookings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      booking_flight_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'BookingFlights',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      booking_passenger_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'BookingPassengers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      flight_seat_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'FlightSeats',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      seat_number:{
        type: Sequelize.STRING
      },
      seat_class_id:{
        type: Sequelize.INTEGER,
        references: {
          model: 'SeatClasses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      base_fare:{
        type: Sequelize.DECIMAL(10,2)
      },
      seat_adjustment:{
        type: Sequelize.DECIMAL(10,2)
      },
      tax:{
        type: Sequelize.DECIMAL(10,2)
      },
      service_fee:{
        type: Sequelize.DECIMAL(10,2)
      },
      total_amount:{
        type: Sequelize.DECIMAL(10,2)
      },
      status:{
        type: Sequelize.STRING
      },
      issued_at: {
        type: Sequelize.DATE
      },
      checked_in_at: {
        type: Sequelize.DATE
      },
      cancelled_at: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tickets');
  }
};