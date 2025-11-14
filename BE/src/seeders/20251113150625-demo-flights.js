'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Flights', [
      // Vietnam Airlines Routes - thêm airline_id và duration_minutes
      { airline_id: 1, flight_number: 'VN201', departure_airport_id: 1, arrival_airport_id: 2, duration_minutes: 135, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // SGN-HAN
      { airline_id: 1, flight_number: 'VN202', departure_airport_id: 2, arrival_airport_id: 1, duration_minutes: 135, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // HAN-SGN
      { airline_id: 1, flight_number: 'VN301', departure_airport_id: 1, arrival_airport_id: 3, duration_minutes: 90, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // SGN-DAD
      { airline_id: 1, flight_number: 'VN302', departure_airport_id: 3, arrival_airport_id: 1, duration_minutes: 90, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // DAD-SGN
      { airline_id: 1, flight_number: 'VN401', departure_airport_id: 2, arrival_airport_id: 3, duration_minutes: 85, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // HAN-DAD
      { airline_id: 1, flight_number: 'VN402', departure_airport_id: 3, arrival_airport_id: 2, duration_minutes: 85, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // DAD-HAN
      { airline_id: 1, flight_number: 'VN501', departure_airport_id: 1, arrival_airport_id: 4, duration_minutes: 80, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // SGN-CXR
      { airline_id: 1, flight_number: 'VN502', departure_airport_id: 4, arrival_airport_id: 1, duration_minutes: 80, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // CXR-SGN
      { airline_id: 1, flight_number: 'VN601', departure_airport_id: 1, arrival_airport_id: 5, duration_minutes: 70, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // SGN-PQC
      { airline_id: 1, flight_number: 'VN602', departure_airport_id: 5, arrival_airport_id: 1, duration_minutes: 70, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // PQC-SGN
      
      // VietJet Routes
      { airline_id: 2, flight_number: 'VJ101', departure_airport_id: 1, arrival_airport_id: 2, duration_minutes: 135, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { airline_id: 2, flight_number: 'VJ102', departure_airport_id: 2, arrival_airport_id: 1, duration_minutes: 135, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { airline_id: 2, flight_number: 'VJ201', departure_airport_id: 1, arrival_airport_id: 3, duration_minutes: 90, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { airline_id: 2, flight_number: 'VJ202', departure_airport_id: 3, arrival_airport_id: 1, duration_minutes: 90, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { airline_id: 2, flight_number: 'VJ301', departure_airport_id: 1, arrival_airport_id: 4, duration_minutes: 80, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // SGN-CXR
      { airline_id: 2, flight_number: 'VJ302', departure_airport_id: 4, arrival_airport_id: 1, duration_minutes: 80, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // CXR-SGN
      
      // Jetstar Routes
      { airline_id: 3, flight_number: 'BL301', departure_airport_id: 1, arrival_airport_id: 2, duration_minutes: 135, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { airline_id: 3, flight_number: 'BL302', departure_airport_id: 2, arrival_airport_id: 1, duration_minutes: 135, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { airline_id: 3, flight_number: 'BL401', departure_airport_id: 1, arrival_airport_id: 5, duration_minutes: 70, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // SGN-PQC
      { airline_id: 3, flight_number: 'BL402', departure_airport_id: 5, arrival_airport_id: 1, duration_minutes: 70, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // PQC-SGN
      
      // Bamboo Airways Routes
      { airline_id: 4, flight_number: 'QH401', departure_airport_id: 1, arrival_airport_id: 2, duration_minutes: 135, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { airline_id: 4, flight_number: 'QH402', departure_airport_id: 2, arrival_airport_id: 1, duration_minutes: 135, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { airline_id: 4, flight_number: 'QH501', departure_airport_id: 1, arrival_airport_id: 3, duration_minutes: 90, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      { airline_id: 4, flight_number: 'QH502', departure_airport_id: 3, arrival_airport_id: 1, duration_minutes: 90, status: 'active', createdAt: new Date(), updatedAt: new Date() },
      
      // International Routes
      { airline_id: 1, flight_number: 'VN701', departure_airport_id: 1, arrival_airport_id: 6, duration_minutes: 105, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // SGN-BKK
      { airline_id: 1, flight_number: 'VN702', departure_airport_id: 6, arrival_airport_id: 1, duration_minutes: 105, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // BKK-SGN
      { airline_id: 1, flight_number: 'VN801', departure_airport_id: 1, arrival_airport_id: 8, duration_minutes: 130, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // SGN-SIN
      { airline_id: 1, flight_number: 'VN802', departure_airport_id: 8, arrival_airport_id: 1, duration_minutes: 130, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // SIN-SGN
      { airline_id: 1, flight_number: 'VN901', departure_airport_id: 2, arrival_airport_id: 10, duration_minutes: 450, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // HAN-HND
      { airline_id: 1, flight_number: 'VN902', departure_airport_id: 10, arrival_airport_id: 2, duration_minutes: 345, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // HND-HAN
      
      // Thai Airways International
      { airline_id: 5, flight_number: 'TG541', departure_airport_id: 6, arrival_airport_id: 1, duration_minutes: 105, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // BKK-SGN
      { airline_id: 5, flight_number: 'TG542', departure_airport_id: 1, arrival_airport_id: 6, duration_minutes: 105, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // SGN-BKK
      { airline_id: 5, flight_number: 'TG621', departure_airport_id: 6, arrival_airport_id: 2, duration_minutes: 95, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // BKK-HAN
      { airline_id: 5, flight_number: 'TG622', departure_airport_id: 2, arrival_airport_id: 6, duration_minutes: 95, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // HAN-BKK

      // More VietJet international routes
      { airline_id: 2, flight_number: 'VJ801', departure_airport_id: 1, arrival_airport_id: 6, duration_minutes: 105, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // SGN-BKK
      { airline_id: 2, flight_number: 'VJ802', departure_airport_id: 6, arrival_airport_id: 1, duration_minutes: 105, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // BKK-SGN
      { airline_id: 2, flight_number: 'VJ901', departure_airport_id: 2, arrival_airport_id: 6, duration_minutes: 95, status: 'active', createdAt: new Date(), updatedAt: new Date() }, // HAN-BKK
      { airline_id: 2, flight_number: 'VJ902', departure_airport_id: 6, arrival_airport_id: 2, duration_minutes: 95, status: 'active', createdAt: new Date(), updatedAt: new Date() } // BKK-HAN
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Flights', null, {});
  }
};
