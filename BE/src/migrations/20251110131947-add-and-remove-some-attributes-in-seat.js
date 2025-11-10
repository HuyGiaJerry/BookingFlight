'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Seats', 'layout_id');

    await queryInterface.addColumn('Seats', 'layout_seat_id',{
      type: Sequelize.INTEGER,
      references: {
        model: 'AirplaneSeatLayouts',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addColumn('Seats', 'seat_number',{
      type: Sequelize.STRING,
      allowNull: false,
    })

    await queryInterface.addColumn('Seats', 'seat_type',{
      type: Sequelize.STRING,
      allowNull: false,
    })

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Seats', 'layout_id',{
      type: Sequelize.INTEGER,
      references: {
        model: 'AirplaneSeatLayouts',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    await queryInterface.removeColumn('Seats', 'layout_seat_id');

    await queryInterface.removeColumn('Seats', 'seat_number');

    await queryInterface.removeColumn('Seats', 'seat_type');
  }
};
