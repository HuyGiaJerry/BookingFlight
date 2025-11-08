'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Airports', 'timezone', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'UTC' // Giá trị mặc định nếu ko có giá trị 
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Airports', 'timezone');
  }
};
