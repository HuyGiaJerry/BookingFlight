'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ServiceOptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      catalog_id: {
        type: Sequelize.INTEGER,
        references:{
          model: 'ServiceCatalogs',
          key: 'id'
        }
      },
      code: {
        type: Sequelize.STRING(100)
      },
      title: {
        type: Sequelize.STRING(200)
      },
      description: {
        type: Sequelize.STRING(500)
      },
      price: {
        type: Sequelize.DOUBLE(10,2)
      },
      extra_meta:{
        type: Sequelize.JSON
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'active'
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
    await queryInterface.dropTable('ServiceOptions');
  }
};