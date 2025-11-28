'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ✅ UPDATED AIRPLANE CONFIGURATIONS với logic mới
    const exactConfigs = {
      // A321 - 184 seats (Narrow-body: Business + Economy only)
      1: {
        type: 'A321', seats: [
          { class: 4, rows: [1, 2, 3], seats: ['A', 'C', 'D', 'F'] }, // First Class: 12 seats
          { class: 3, rows: [4, 5, 6], seats: ['A', 'C', 'D', 'F'] }, // Business: 12 seats  
          { class: 1, rows: Array.from({ length: 26 }, (_, i) => i + 7), seats: ['A', 'B', 'C', 'D', 'E', 'F'], skip: [17] } // Economy: 160 seats (25*6+10)
        ]
      }, // Total: 12 + 12 + 160 = 184 ✅

      4: {
        type: 'A321', seats: [
          { class: 4, rows: [1, 2, 3], seats: ['A', 'C', 'D', 'F'] },
          { class: 3, rows: [4, 5, 6], seats: ['A', 'C', 'D', 'F'] },
          { class: 1, rows: Array.from({ length: 26 }, (_, i) => i + 7), seats: ['A', 'B', 'C', 'D', 'E', 'F'], skip: [17] }
        ]
      },
      5: {
        type: 'A321', seats: [
          { class: 4, rows: [1, 2, 3], seats: ['A', 'C', 'D', 'F'] },
          { class: 3, rows: [4, 5, 6], seats: ['A', 'C', 'D', 'F'] },
          { class: 1, rows: Array.from({ length: 26 }, (_, i) => i + 7), seats: ['A', 'B', 'C', 'D', 'E', 'F'], skip: [17] }
        ]
      },
      7: {
        type: 'A321', seats: [
          { class: 4, rows: [1, 2, 3], seats: ['A', 'C', 'D', 'F'] },
          { class: 3, rows: [4, 5, 6], seats: ['A', 'C', 'D', 'F'] },
          { class: 1, rows: Array.from({ length: 26 }, (_, i) => i + 7), seats: ['A', 'B', 'C', 'D', 'E', 'F'], skip: [17] }
        ]
      },
      9: {
        type: 'A321', seats: [
          { class: 4, rows: [1, 2, 3], seats: ['A', 'C', 'D', 'F'] },
          { class: 3, rows: [4, 5, 6], seats: ['A', 'C', 'D', 'F'] },
          { class: 1, rows: Array.from({ length: 26 }, (_, i) => i + 7), seats: ['A', 'B', 'C', 'D', 'E', 'F'], skip: [17] }
        ]
      },
      10: {
        type: 'A321', seats: [
          { class: 4, rows: [1, 2, 3], seats: ['A', 'C', 'D', 'F'] },
          { class: 3, rows: [4, 5, 6], seats: ['A', 'C', 'D', 'F'] },
          { class: 1, rows: Array.from({ length: 26 }, (_, i) => i + 7), seats: ['A', 'B', 'C', 'D', 'E', 'F'], skip: [17] }
        ]
      },

      // A350 - 305 seats (Wide-body: All classes)
      2: {
        type: 'A350', seats: [
          { class: 4, rows: [1, 2, 3], seats: ['A', 'F'] }, // First: 6 seats
          { class: 3, rows: [4, 5, 6], seats: ['A', 'D', 'G', 'K'] }, // Business: 12 seats
          { class: 2, rows: [7, 8, 9], seats: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] }, // Premium Economy: 21 seats
          { class: 1, rows: Array.from({ length: 38 }, (_, i) => i + 10), seats: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] } // Economy: 266 seats (38*7)
        ]
      }, // Total: 6 + 12 + 21 + 266 = 305 ✅

      13: {
        type: 'A350', seats: [
          { class: 4, rows: [1, 2, 3], seats: ['A', 'F'] },
          { class: 3, rows: [4, 5, 6], seats: ['A', 'D', 'G', 'K'] },
          { class: 2, rows: [7, 8, 9], seats: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
          { class: 1, rows: Array.from({ length: 38 }, (_, i) => i + 10), seats: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] }
        ]
      },

      // Boeing 787 - 294 seats (Wide-body: All classes)
      3: {
        type: 'B787', seats: [
          { class: 4, rows: [1, 2, 3], seats: ['A', 'F'] }, // First: 6 seats
          { class: 3, rows: [4, 5, 6], seats: ['A', 'D', 'G', 'K'] }, // Business: 12 seats
          { class: 2, rows: [7, 8, 9], seats: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] }, // Premium Economy: 21 seats
          { class: 1, rows: Array.from({ length: 35 }, (_, i) => i + 10), seats: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], skip: [30] } // Economy: 255 seats (36*7-21)
        ]
      }, // Total: 6 + 12 + 21 + 255 = 294 ✅

      11: {
        type: 'B787', seats: [
          { class: 4, rows: [1, 2, 3], seats: ['A', 'F'] },
          { class: 3, rows: [4, 5, 6], seats: ['A', 'D', 'G', 'K'] },
          { class: 2, rows: [7, 8, 9], seats: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
          { class: 1, rows: Array.from({ length: 35 }, (_, i) => i + 10), seats: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], skip: [30] }
        ]
      },

      // A320 - 180 seats (Single-class Economy only)
      6: {
        type: 'A320', seats: [
          { class: 1, rows: Array.from({ length: 30 }, (_, i) => i + 1), seats: ['A', 'B', 'C', 'D', 'E', 'F'] }
        ]
      }, // Total: 180 ✅

      8: {
        type: 'A320', seats: [
          { class: 1, rows: Array.from({ length: 30 }, (_, i) => i + 1), seats: ['A', 'B', 'C', 'D', 'E', 'F'] }
        ]
      },

      // Boeing 777 - 346 seats (Wide-body: All classes)
      12: {
        type: 'B777', seats: [
          { class: 4, rows: [1, 2, 3], seats: ['A', 'F'] }, // First: 6 seats
          { class: 3, rows: [4, 5, 6], seats: ['A', 'D', 'G', 'K'] }, // Business: 12 seats
          { class: 2, rows: [7, 8, 9], seats: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] }, // Premium Economy: 21 seats
          { class: 1, rows: Array.from({ length: 35 }, (_, i) => i + 10), seats: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'], skip: [25, 35] } // Economy: 307 seats (35*9-8)
        ]
      } // Total: 6 + 12 + 21 + 307 = 346 ✅
    };

    const layouts = [];

    // Generate seats for each airplane
    for (const [airplaneId, config] of Object.entries(exactConfigs)) {
      let seatsCreated = 0;

      for (const classConfig of config.seats) {
        for (const row of classConfig.rows) {
          if (classConfig.skip && classConfig.skip.includes(row)) continue;

          for (let seatIndex = 0; seatIndex < classConfig.seats.length; seatIndex++) {
            const seatLetter = classConfig.seats[seatIndex];
            const seatNumber = `${row}${seatLetter}`;

            // ✅ UPDATED: Determine seat characteristics based on seat layout
            const totalSeatsInRow = classConfig.seats.length;
            let isWindow = seatIndex === 0 || seatIndex === totalSeatsInRow - 1;
            let isAisle = false;

            // ✅ IMPROVED: Aisle logic based on cabin configuration
            if (totalSeatsInRow === 9) { // Boeing 777 economy (3-3-3 configuration)
              isAisle = seatIndex === 2 || seatIndex === 6;
              isWindow = seatIndex === 0 || seatIndex === 8;
            } else if (totalSeatsInRow === 7) { // A350/787 (3-3-1 or 2-3-2 configuration)
              isAisle = seatIndex === 2 || seatIndex === 4;
              isWindow = seatIndex === 0 || seatIndex === 6;
            } else if (totalSeatsInRow === 6) { // A321/A320 (3-3 configuration)
              isAisle = seatIndex === 2 || seatIndex === 3;
              isWindow = seatIndex === 0 || seatIndex === 5;
            } else if (totalSeatsInRow === 4) { // Business (2-2 configuration)
              isAisle = seatIndex === 1 || seatIndex === 2;
              isWindow = seatIndex === 0 || seatIndex === 3;
            } else if (totalSeatsInRow === 2) { // First class (1-1 configuration)
              isWindow = true;
              isAisle = true; // First class seats are both window and aisle
            }

            layouts.push({
              airplane_id: parseInt(airplaneId),
              seat_class_id: classConfig.class,
              seat_number: seatNumber,
              seat_row: row,
              seat_column: seatLetter,
              is_window: isWindow,
              is_aisle: isAisle,
              is_exit_row: row % 10 === 0, // Every 10th row is emergency exit
              createdAt: new Date(),
              updatedAt: new Date()
            });

            seatsCreated++;
          }
        }
      }

      console.log(`✅ Airplane ${airplaneId} (${config.type}): Created ${seatsCreated} seats`);
    }

    // ✅ VERIFY: Check seat counts per class for each airplane
    for (const [airplaneId, config] of Object.entries(exactConfigs)) {
      const airplaneSeats = layouts.filter(l => l.airplane_id === parseInt(airplaneId));
      const classBreakdown = {
        4: airplaneSeats.filter(s => s.seat_class_id === 4).length, // First
        3: airplaneSeats.filter(s => s.seat_class_id === 3).length, // Business
        2: airplaneSeats.filter(s => s.seat_class_id === 2).length, // Premium Economy
        1: airplaneSeats.filter(s => s.seat_class_id === 1).length  // Economy
      };

      console.log(`📊 Airplane ${airplaneId} breakdown: F=${classBreakdown[4]}, J=${classBreakdown[3]}, W=${classBreakdown[2]}, Y=${classBreakdown[1]} = ${airplaneSeats.length} total`);
    }

    // Bulk insert with progress tracking
    const batchSize = 1000;
    for (let i = 0; i < layouts.length; i += batchSize) {
      const batch = layouts.slice(i, i + batchSize);
      await queryInterface.bulkInsert('SeatLayouts', batch, {});
      console.log(`📦 Inserted SeatLayouts batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(layouts.length / batchSize)}`);
    }

    console.log(`✅ Total seat layouts created: ${layouts.length}`);
    return layouts.length;
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('SeatLayouts', null, {});
  }
};
