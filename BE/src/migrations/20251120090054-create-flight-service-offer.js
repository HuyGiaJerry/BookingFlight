'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FlightServiceOffers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      flight_schedule_id: {
        type: Sequelize.INTEGER,
        references:{
          model: 'FlightSchedules',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      service_option_id: {
        type: Sequelize.INTEGER,
        references:{
          model: 'ServiceOptions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      price_override: {
        type: Sequelize.DOUBLE(10,2),
        allowNull: true
      },
      is_free:{
        type:Sequelize.BOOLEAN,
        defaultValue:false
      },
      included_quantity:{
        type:Sequelize.INTEGER,
        defaultValue:0
      },
      capacity:{
        type:Sequelize.INTEGER,
        allowNull:true
      },
      sold_count:{
        type:Sequelize.INTEGER,
      },
      available_from:{
        type:Sequelize.DATE,
      },
      available_until:{
        type:Sequelize.DATE,
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'available'
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
    await queryInterface.dropTable('FlightServiceOffers');
  }
};