'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FlightSeats', {
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
      seat_layout_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'SeatLayouts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      price_adjustment: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      blocked_session_id: {          // ✅ SỬA: blocked_session_id
        type: Sequelize.STRING,
        allowNull: true
      },
      blocked_at: {                  // ✅ SỬA: blocked_at
        type: Sequelize.DATE,
        allowNull: true
      },
      blocked_until: {               // ✅ SỬA: blocked_until
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
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
    await queryInterface.dropTable('FlightSeats');
  }
};