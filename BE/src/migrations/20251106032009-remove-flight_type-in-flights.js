'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Flights', 'flight_type');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Flights', 'flight_type', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
