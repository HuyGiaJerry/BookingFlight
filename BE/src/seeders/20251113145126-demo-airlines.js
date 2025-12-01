'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Airlines', [
      {
        name: 'Vietnam Airlines',
        iata_code: 'VN',
        logo_url: 'https://ik.imagekit.io/tvlk/image/imageResource/2017/12/13/1513150621127-5096be77d2a19401b476853e54ba2cc6.png',
        logo_public_id: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'VietJet Air',
        iata_code: 'VJ',
        logo_url: 'https://ik.imagekit.io/tvlk/image/imageResource/2017/12/13/1513150890262-91c5c925ab2506e0731cd3c7de2bb2e8.png',
        logo_public_id: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jetstar Pacific',
        iata_code: 'BL',
        logo_url: 'https://ik.imagekit.io/tvlk/image/imageResource/2017/12/13/1513150890262-jetstar.png',
        logo_public_id: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bamboo Airways',
        iata_code: 'QH',
        logo_url: 'https://ik.imagekit.io/tvlk/image/imageResource/2019/02/28/1551346673212-bamboo.png',
        logo_public_id: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Thai Airways',
        iata_code: 'TG',
        logo_url: 'https://ik.imagekit.io/tvlk/image/imageResource/2017/12/13/thai-airways.png',
        logo_public_id: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Airlines', null, {});
  }
};
