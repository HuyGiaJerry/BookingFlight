'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BookingServiceItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      booking_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Bookings', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      booking_flight_id:{
        type: Sequelize.INTEGER,
        references: { model: 'BookingFlights', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      booking_passenger_id:{
        type: Sequelize.INTEGER,
        references: { model: 'BookingPassengers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      ticket_id:{
        type: Sequelize.INTEGER,
        references: { model: 'Tickets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      flight_service_offer_id:{
        type: Sequelize.INTEGER,
        references: { model: 'FlightServiceOffers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      service_option_id:{
        type: Sequelize.INTEGER,
        references: { model: 'ServiceOptions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      unit_price: {
        type: Sequelize.DOUBLE(10,2)
      },
      total_price: {
        type: Sequelize.DOUBLE(10,2)
      },
      meta:{
        type: Sequelize.JSON
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'purchased'
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
    await queryInterface.dropTable('BookingServiceItems');
  }
};