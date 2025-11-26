'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get actual data from database
    const [schedules] = await queryInterface.sequelize.query(`
      SELECT id as schedule_id, airplane_id FROM FlightSchedules ORDER BY id ASC
    `);

    const [seatLayouts] = await queryInterface.sequelize.query(`
      SELECT id as layout_id, airplane_id, seat_class_id, seat_number, seat_row, is_window, is_aisle
      FROM SeatLayouts 
      ORDER BY airplane_id ASC, seat_class_id ASC, seat_row ASC, seat_number ASC
    `);

    console.log(`Found ${schedules.length} schedules and ${seatLayouts.length} seat layouts`);

    const flightSeats = [];

    for (const schedule of schedules) {
      // Get all seat layouts for this airplane
      const airplaneSeats = seatLayouts.filter(seat => seat.airplane_id === schedule.airplane_id);

      if (airplaneSeats.length === 0) {
        console.log(`Warning: No seat layouts found for airplane ${schedule.airplane_id}, schedule ${schedule.schedule_id}`);
        continue;
      }

      // Create flight seat for each seat layout
      airplaneSeats.forEach(seatLayout => {
        const random = Math.random();
        let status = 'available';
        let priceAdjustment = 0;
        let blockedSessionId = null;         // ✅ SỬA: blockedSessionId
        let blockedAt = null;                // ✅ SỬA: blockedAt
        let blockedUntil = null;             // ✅ SỬA: blockedUntil

        // Status distribution
        if (random < 0.30) {
          status = 'booked';
          // ❌ Không set blocked_at cho booked seats
        } else if (random < 0.33) {
          status = 'blocked';
          blockedSessionId = 'session_' + Math.random().toString(36).substring(2, 15);
          blockedAt = new Date();            // ✅ SỬA: blocked_at
          blockedUntil = new Date(Date.now() + (5 + Math.random() * 10) * 60 * 1000); // ✅ SỬA: blocked_until
        } else if (random < 0.36) {
          status = 'maintenance';
        }

        // Price adjustments based on seat characteristics
        if (seatLayout.seat_class_id === 4) { // First class
          priceAdjustment = 500000;
        } else if (seatLayout.seat_class_id === 3) { // Business
          priceAdjustment = 200000;
        } else if (seatLayout.seat_class_id === 2) { // Premium Economy
          priceAdjustment = 100000;
        } else { // Economy
          if (seatLayout.seat_row <= 5) {
            priceAdjustment = 50000; // Front rows
          } else if (seatLayout.is_window) {
            priceAdjustment = 25000; // Window seats
          } else if (seatLayout.is_aisle) {
            priceAdjustment = 15000; // Aisle seats
          }
        }

        flightSeats.push({
          flight_schedule_id: schedule.schedule_id,
          seat_layout_id: seatLayout.layout_id,
          price_adjustment: priceAdjustment,
          blocked_session_id: blockedSessionId,  // ✅ SỬA: blocked_session_id
          blocked_at: blockedAt,                 // ✅ SỬA: blocked_at
          blocked_until: blockedUntil,           // ✅ SỬA: blocked_until
          status: status,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });

      if (schedule.schedule_id % 100 === 0) {
        console.log(`Processed schedule ${schedule.schedule_id}/${schedules.length}`);
      }
    }

    // Bulk insert with batches
    const batchSize = 1000;
    for (let i = 0; i < flightSeats.length; i += batchSize) {
      const batch = flightSeats.slice(i, i + batchSize);
      await queryInterface.bulkInsert('FlightSeats', batch, {});
      console.log(`Inserted FlightSeats batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(flightSeats.length / batchSize)}`);
    }

    console.log(`Total flight seats created: ${flightSeats.length}`);
    return flightSeats.length;
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FlightSeats', null, {});
  }
};
