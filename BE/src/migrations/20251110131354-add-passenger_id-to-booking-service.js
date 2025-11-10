'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('BookingServices', 'passenger_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Passengers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'

    });

    await queryInterface.addColumn('BookingServices', 'quantity', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('BookingServices', 'passenger_id');
    await queryInterface.removeColumn('BookingServices', 'quantity');
  }
};
