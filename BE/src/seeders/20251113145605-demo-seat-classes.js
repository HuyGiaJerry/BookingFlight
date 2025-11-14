'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('SeatClasses', [
      {
        class_name: 'Economy',
        class_code: 'ECO',
        description: 'Standard economy class with basic amenities',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        class_name: 'Premium Economy',
        class_code: 'PEC',
        description: 'Enhanced economy with extra legroom and premium service',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        class_name: 'Business',
        class_code: 'BUS',
        description: 'Business class with lie-flat seats and premium dining',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        class_name: 'First Class',
        class_code: 'FST',
        description: 'Luxury first class with private suites and premium service',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('SeatClasses', null, {});
  }
};
