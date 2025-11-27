'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BookingSessions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Accounts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      session_data: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      total_estimate: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      expire_at: {
        type: Sequelize.DATE,
        allowNull: false
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
    await queryInterface.dropTable('BookingSessions');
  }
};