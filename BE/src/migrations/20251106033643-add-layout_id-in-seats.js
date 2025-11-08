'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Seats', 'layout_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'AirplaneSeatLayouts',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Seats', 'layout_id');
  }
};
