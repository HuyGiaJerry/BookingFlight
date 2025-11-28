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
        let blockedSessionId = null;
        let blockedAt = null;
        let blockedUntil = null;

        // Status distribution
        if (random < 0.30) {
          status = 'booked';
        } else if (random < 0.33) {
          status = 'blocked';
          blockedSessionId = 'session_' + Math.random().toString(36).substring(2, 15);
          blockedAt = new Date();
          blockedUntil = new Date(Date.now() + (5 + Math.random() * 10) * 60 * 1000);
        } else if (random < 0.36) {
          status = 'maintenance';
        }

        // ✅ UPDATED: Price adjustments based on NEW seat class hierarchy
        if (seatLayout.seat_class_id === 4) { // First Class
          priceAdjustment = 800000; // Increased for First Class
        } else if (seatLayout.seat_class_id === 3) { // Business
          priceAdjustment = 300000; // Increased for Business
        } else if (seatLayout.seat_class_id === 2) { // Premium Economy
          priceAdjustment = 150000; // Increased for Premium Economy
        } else { // Economy (class_id === 1)
          if (seatLayout.seat_row <= 5) {
            priceAdjustment = 75000; // Front economy rows (premium location)
          } else if (seatLayout.is_window) {
            priceAdjustment = 35000; // Window seats
          } else if (seatLayout.is_aisle) {
            priceAdjustment = 25000; // Aisle seats
          }
        }

        flightSeats.push({
          flight_schedule_id: schedule.schedule_id,
          seat_layout_id: seatLayout.layout_id,
          price_adjustment: priceAdjustment,
          blocked_session_id: blockedSessionId,
          blocked_at: blockedAt,
          blocked_until: blockedUntil,
          status: status,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });

      if (schedule.schedule_id % 100 === 0) {
        console.log(`📊 Processed schedule ${schedule.schedule_id}/${schedules.length}`);
      }
    }

    // Bulk insert with batches
    const batchSize = 1000;
    for (let i = 0; i < flightSeats.length; i += batchSize) {
      const batch = flightSeats.slice(i, i + batchSize);
      await queryInterface.bulkInsert('FlightSeats', batch, {});
      console.log(`📦 Inserted FlightSeats batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(flightSeats.length / batchSize)}`);
    }

    console.log(`✅ Total flight seats created: ${flightSeats.length}`);
    return flightSeats.length;
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FlightSeats', null, {});
  }
};
