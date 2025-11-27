'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      refresh_token: {
        type: Sequelize.STRING(512),
        allowNull: false,
        unique: true
      },
      expire_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Accounts',  
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    // Index tối ưu hiệu suất
    await queryInterface.addIndex('Sessions', ['refresh_token'], {
      unique: true,
      name: 'idx_sessions_refresh_token'
    });
    await queryInterface.addIndex('Sessions', ['expire_at'], {
      name: 'idx_sessions_expire_at'
    });
    await queryInterface.addIndex('Sessions', ['account_id'], {
      name: 'idx_sessions_account_id'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Sessions');
  }
};
