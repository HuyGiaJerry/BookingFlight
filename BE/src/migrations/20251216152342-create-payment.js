'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID
      },
      booking_id: {
        type: Sequelize.INTEGER
      },
      amount:{
        type: Sequelize.DECIMAL(15,2)
      },
      payment_method:{
        type: Sequelize.STRING(50)
      },
      payment_status:{
        type: Sequelize.STRING(50)
      },
      transaction_id:{
        type: Sequelize.STRING(200)
      },
      gateway_response:{
        type: Sequelize.JSON
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
    await queryInterface.dropTable('Payments');
  }
};