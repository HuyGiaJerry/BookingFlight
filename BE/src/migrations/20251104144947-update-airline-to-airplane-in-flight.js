'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Xóa cột airline_id khỏi bảng Flights
    await queryInterface.removeColumn('Flights', 'airline_id');
    // Thêm cột airplane_id vào bảng Flights
    await queryInterface.addColumn('Flights', 'airplane_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Airplanes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

  },

  async down (queryInterface, Sequelize) {
    // Thêm lại cột airline_id vào bảng Flights
    await queryInterface.addColumn('Flights', 'airline_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Airlines',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    // Xóa cột airplane_id khỏi bảng Flights
    await queryInterface.removeColumn('Flights', 'airplane_id');
  }
};
