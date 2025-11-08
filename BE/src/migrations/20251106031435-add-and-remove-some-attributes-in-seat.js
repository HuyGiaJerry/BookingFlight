'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Seats', 'seat_type');
    await queryInterface.removeColumn('Seats', 'seat_number');
    await queryInterface.addColumn('Seats', 'price_override', {
      type: Sequelize.DOUBLE,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Seats', 'seat_type', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('Seats', 'seat_number', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.removeColumn('Seats', 'price_override');
  }
};
