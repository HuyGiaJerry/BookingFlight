'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Airplanes', [
      // Vietnam Airlines Fleet - CORRECTED total_seats
      { airline_id: 1, model: 'Airbus A321', registration_number: 'VN-A621', total_seats: 184, createdAt: new Date(), updatedAt: new Date() },
      { airline_id: 1, model: 'Airbus A350', registration_number: 'VN-A891', total_seats: 305, createdAt: new Date(), updatedAt: new Date() },
      { airline_id: 1, model: 'Boeing 787', registration_number: 'VN-A861', total_seats: 294, createdAt: new Date(), updatedAt: new Date() },
      { airline_id: 1, model: 'Airbus A321', registration_number: 'VN-A622', total_seats: 184, createdAt: new Date(), updatedAt: new Date() },

      // VietJet Air Fleet - CORRECTED total_seats
      { airline_id: 2, model: 'Airbus A321', registration_number: 'VN-A681', total_seats: 184, createdAt: new Date(), updatedAt: new Date() }, // FIXED: 230 -> 184
      { airline_id: 2, model: 'Airbus A320', registration_number: 'VN-A671', total_seats: 180, createdAt: new Date(), updatedAt: new Date() },
      { airline_id: 2, model: 'Airbus A321', registration_number: 'VN-A682', total_seats: 184, createdAt: new Date(), updatedAt: new Date() }, // FIXED: 230 -> 184

      // Jetstar Pacific Fleet - CORRECTED total_seats
      { airline_id: 3, model: 'Airbus A320', registration_number: 'VN-A561', total_seats: 180, createdAt: new Date(), updatedAt: new Date() },
      { airline_id: 3, model: 'Airbus A321', registration_number: 'VN-A571', total_seats: 184, createdAt: new Date(), updatedAt: new Date() }, // FIXED: 230 -> 184

      // Bamboo Airways Fleet - CORRECTED total_seats
      { airline_id: 4, model: 'Airbus A321', registration_number: 'VN-A591', total_seats: 184, createdAt: new Date(), updatedAt: new Date() }, // FIXED: 196 -> 184
      { airline_id: 4, model: 'Boeing 787', registration_number: 'VN-A819', total_seats: 294, createdAt: new Date(), updatedAt: new Date() },

      // Thai Airways Fleet
      { airline_id: 5, model: 'Boeing 777', registration_number: 'HS-TKF', total_seats: 346, createdAt: new Date(), updatedAt: new Date() },
      { airline_id: 5, model: 'Airbus A350', registration_number: 'HS-THG', total_seats: 305, createdAt: new Date(), updatedAt: new Date() } // FIXED: 321 -> 305
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Airplanes', null, {});
  }
};
