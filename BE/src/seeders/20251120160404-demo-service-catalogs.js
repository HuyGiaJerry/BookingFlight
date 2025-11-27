'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('ServiceCatalogs', [
      {
        code: 'MEAL',
        title: 'In-Flight Meals',
        description: 'Pre-ordered meal options for your flight',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'BAGGAGE',
        title: 'Extra Baggage',
        description: 'Additional checked baggage allowance',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'INSURANCE',
        title: 'Travel Protection',
        description: 'Comprehensive travel insurance coverage',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'WIFI',
        title: 'In-Flight WiFi',
        description: 'Internet connectivity during your flight',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        code: 'PRIORITY',
        title: 'Priority Services',
        description: 'Fast-track and priority boarding services',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    console.log('✅ ServiceCatalogs seeder completed: 5 catalogs created');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ServiceCatalogs', null, {});
  }
};