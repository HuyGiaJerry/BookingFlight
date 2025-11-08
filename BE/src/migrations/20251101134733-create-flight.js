'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Flights', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      flight_number: {
        type: Sequelize.STRING
      },
      departure_airport_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Airports',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      arrival_airport_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Airports',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      airline_id: {
        type: Sequelize.INTEGER,
        references:{
          model: 'Airlines',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      duration:{
        type: Sequelize.INTEGER
      },
      base_price: {
        type: Sequelize.DOUBLE
      },
      flight_type: {
        type: Sequelize.STRING
      },
      flight_status: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Flights');
  }
};