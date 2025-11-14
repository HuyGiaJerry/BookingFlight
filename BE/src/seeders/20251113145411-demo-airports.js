'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Airports', [
      // Vietnam
      {
        name: 'Tan Son Nhat International Airport',
        iata_code: 'SGN',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
        timezone: 'Asia/Ho_Chi_Minh',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Noi Bai International Airport',
        iata_code: 'HAN',
        city: 'Hanoi',
        country: 'Vietnam',
        timezone: 'Asia/Ho_Chi_Minh',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Da Nang International Airport',
        iata_code: 'DAD',
        city: 'Da Nang',
        country: 'Vietnam',
        timezone: 'Asia/Ho_Chi_Minh',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cam Ranh International Airport',
        iata_code: 'CXR',
        city: 'Nha Trang',
        country: 'Vietnam',
        timezone: 'Asia/Ho_Chi_Minh',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Phu Quoc International Airport',
        iata_code: 'PQC',
        city: 'Phu Quoc',
        country: 'Vietnam',
        timezone: 'Asia/Ho_Chi_Minh',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Thailand
      {
        name: 'Suvarnabhumi Airport',
        iata_code: 'BKK',
        city: 'Bangkok',
        country: 'Thailand',
        timezone: 'Asia/Bangkok',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Phuket International Airport',
        iata_code: 'HKT',
        city: 'Phuket',
        country: 'Thailand',
        timezone: 'Asia/Bangkok',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Singapore
      {
        name: 'Singapore Changi Airport',
        iata_code: 'SIN',
        city: 'Singapore',
        country: 'Singapore',
        timezone: 'Asia/Singapore',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Malaysia
      {
        name: 'Kuala Lumpur International Airport',
        iata_code: 'KUL',
        city: 'Kuala Lumpur',
        country: 'Malaysia',
        timezone: 'Asia/Kuala_Lumpur',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Japan
      {
        name: 'Tokyo Haneda Airport',
        iata_code: 'HND',
        city: 'Tokyo',
        country: 'Japan',
        timezone: 'Asia/Tokyo',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Airports', null, {});
  }
};
