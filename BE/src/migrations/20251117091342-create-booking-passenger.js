'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BookingPassengers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      booking_id: {
        type: Sequelize.INTEGER,
        references:{
          model: 'Bookings',
          key: 'id'
        }
      },
      passenger_id: {
        type: Sequelize.INTEGER,
        references:{
          model: 'Passengers',
          key: 'id'
        }
      },
      fullname: {
        type: Sequelize.STRING
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: false
      },
      date_of_birth: {
        type: Sequelize.DATE
      },
      nationality: {
        type: Sequelize.STRING
      },
      passenger_type:{
        type: Sequelize.ENUM('adult', 'child', 'infant'),
        allowNull: false
      },
      passport_number: {
        type: Sequelize.STRING
      },
      passport_expiry: {
        type: Sequelize.DATE
      },
      id_card_number: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('BookingPassengers');
  }
};