'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Get actual flight schedules to determine airplane types
    const [schedules] = await queryInterface.sequelize.query(`
      SELECT fs.id as schedule_id, fs.airplane_id, a.model, a.total_seats
      FROM FlightSchedules fs
      JOIN Airplanes a ON fs.airplane_id = a.id
      ORDER BY fs.id ASC
    `);

    // Get seat classes
    const [seatClasses] = await queryInterface.sequelize.query(`
      SELECT id, class_code FROM SeatClasses ORDER BY id ASC
    `);

    const fares = [];

    // ✅ UPDATED: Price configuration based on new class structure
    const basePrices = {
      domestic: 1500000,
      international: 3500000
    };

    const classMultipliers = {
      1: 1.0,    // Economy
      2: 1.8,    // Premium Economy (increased from 1.5)
      3: 3.5,    // Business (increased from 3.0)
      4: 6.0     // First Class (increased from 5.0)
    };

    for (const schedule of schedules) {
      // Determine if international (airplane 2, 12, 13 are used for international)
      const isInternational = [2, 12, 13].includes(schedule.airplane_id);
      const basePrice = isInternational ? basePrices.international : basePrices.domestic;

      // ✅ UPDATED: Determine available classes based on airplane type
      const availableClasses = getAvailableClasses(schedule.model, isInternational);

      for (const seatClass of seatClasses) {
        if (!availableClasses.includes(seatClass.id)) continue;

        const classMultiplier = classMultipliers[seatClass.id];
        const finalBasePrice = Math.round(basePrice * classMultiplier);
        const tax = Math.round(finalBasePrice * 0.1);
        const serviceFee = Math.round(finalBasePrice * 0.05);

        // ✅ UPDATED: Calculate seat allocation based on NEW seat layout
        const seatCounts = getSeatCountsForClass(schedule.airplane_id, seatClass.id, schedule.model);
        const seatsBooked = Math.floor(Math.random() * seatCounts.total * 0.7); // 0-70% booked
        const seatsAvailable = seatCounts.total - seatsBooked;

        fares.push({
          flight_schedule_id: schedule.schedule_id,
          seat_class_id: seatClass.id,
          base_price: finalBasePrice,
          tax: tax,
          service_fee: serviceFee,
          total_seats_allocated: seatCounts.total,
          seats_booked: seatsBooked,
          seats_available: seatsAvailable,
          status: seatsAvailable > 0 ? 'available' : 'sold_out',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    console.log(`✅ Total flight fares created: ${fares.length}`);
    await queryInterface.bulkInsert('FlightFares', fares, {});
    return fares.length;

    // ✅ UPDATED: Helper functions based on new seat configuration
    function getAvailableClasses(model, isInternational) {
      if (model.includes('A320')) {
        return [1]; // Economy only (single-class configuration)
      } else if (model.includes('A321')) {
        return isInternational ? [1, 3, 4] : [1, 3, 4]; // Economy + Business + First Class
      } else if (model.includes('A350') || model.includes('787') || model.includes('777')) {
        return [1, 2, 3, 4]; // All classes available (wide-body aircraft)
      }
      return [1]; // Default to economy only
    }

    function getSeatCountsForClass(airplaneId, classId, model) {
      // ✅ UPDATED: Seat counts based on NEW layout configuration
      const seatCounts = {
        // A321 - 184 total (First: 12, Business: 12, Economy: 160)
        'A321': {
          1: 160, // Economy (rows 7-32, skip row 17)
          2: 0,   // No Premium Economy
          3: 12,  // Business (rows 4-6)
          4: 12   // First Class (rows 1-3)
        },
        // A350 - 305 total (First: 6, Business: 12, Premium: 21, Economy: 266)
        'A350': {
          1: 266, // Economy (rows 10-47)
          2: 21,  // Premium Economy (rows 7-9)
          3: 12,  // Business (rows 4-6)
          4: 6    // First Class (rows 1-3)
        },
        // Boeing 787 - 294 total (First: 6, Business: 12, Premium: 21, Economy: 255)
        'B787': {
          1: 255, // Economy (rows 10-44, skip row 30)
          2: 21,  // Premium Economy (rows 7-9)
          3: 12,  // Business (rows 4-6)
          4: 6    // First Class (rows 1-3)
        },
        // A320 - 180 total (Economy only)
        'A320': {
          1: 180, // Economy only
          2: 0, 3: 0, 4: 0
        },
        // Boeing 777 - 346 total (First: 6, Business: 12, Premium: 21, Economy: 307)
        'B777': {
          1: 307, // Economy (rows 10-44, skip rows 25&35)
          2: 21,  // Premium Economy (rows 7-9)
          3: 12,  // Business (rows 4-6)
          4: 6    // First Class (rows 1-3)
        }
      };

      const modelKey = model.replace(/\s+/g, '').replace('Airbus', '').replace('Boeing', 'B');
      const counts = seatCounts[modelKey] || { 1: 180, 2: 0, 3: 0, 4: 0 };

      return {
        total: counts[classId] || 0
      };
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FlightFares', null, {});
  }
};
