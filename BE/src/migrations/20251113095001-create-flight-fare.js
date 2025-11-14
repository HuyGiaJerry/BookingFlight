'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FlightFares', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      flight_schedule_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'FlightSchedules',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      seat_class_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'SeatClasses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      base_price:{
        type: Sequelize.DECIMAL(10, 2),
      },
      tax: {
        type: Sequelize.DECIMAL(10, 2),
      },
      service_fee: {
        type: Sequelize.DECIMAL(10, 2),
      },
      total_seats_allocated: {
        type: Sequelize.INTEGER,
      },
      seats_booked: {
        type: Sequelize.INTEGER,
      },
      seats_available: {
        type: Sequelize.INTEGER,
      },
      status: {
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
    await queryInterface.dropTable('FlightFares');
  }
};