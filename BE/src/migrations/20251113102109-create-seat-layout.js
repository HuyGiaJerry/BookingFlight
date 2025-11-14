'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SeatLayouts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      airplane_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Airplanes',
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
      seat_number: Sequelize.STRING,
      seat_row: Sequelize.INTEGER,
      seat_column: Sequelize.STRING,
      is_window: Sequelize.BOOLEAN,
      is_aisle: Sequelize.BOOLEAN,
      is_exit_row: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable('SeatLayouts');
  }
};