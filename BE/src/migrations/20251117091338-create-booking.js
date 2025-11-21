'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      booking_code: {
        type: Sequelize.STRING
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Accounts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      contact_email: {
        type: Sequelize.STRING
      },
      contact_phone:{
        type: Sequelize.STRING
      },
      booking_type:{
        type: Sequelize.STRING
      },
      total_amount:{
        type: Sequelize.DECIMAL(10,2)
      },
      status:{
        type: Sequelize.STRING
      },
      payment_status:{
        type: Sequelize.STRING
      },
      confirmed_at: {
        type: Sequelize.DATE
      },
      expired_at: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('Bookings');
  }
};