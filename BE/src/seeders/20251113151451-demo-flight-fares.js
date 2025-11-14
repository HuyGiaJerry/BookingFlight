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

    // Price configuration
    const basePrices = {
      domestic: 1500000,
      international: 3500000
    };

    const classMultipliers = {
      1: 1.0,    // Economy
      2: 1.5,    // Premium Economy
      3: 3.0,    // Business
      4: 5.0     // First Class
    };

    for (const schedule of schedules) {
      // Determine if international (airplane 2, 12, 13 are used for international)
      const isInternational = [2, 12, 13].includes(schedule.airplane_id);
      const basePrice = isInternational ? basePrices.international : basePrices.domestic;

      // Determine available classes based on airplane type
      const availableClasses = getAvailableClasses(schedule.model, isInternational);

      for (const seatClass of seatClasses) {
        if (!availableClasses.includes(seatClass.id)) continue;

        const classMultiplier = classMultipliers[seatClass.id];
        const finalBasePrice = Math.round(basePrice * classMultiplier);
        const tax = Math.round(finalBasePrice * 0.1);
        const serviceFee = Math.round(finalBasePrice * 0.05);

        // Calculate seat allocation based on actual seat layout
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

    console.log(`Total flight fares created: ${fares.length}`);
    await queryInterface.bulkInsert('FlightFares', fares, {});
    return fares.length;

    // Helper functions
    function getAvailableClasses(model, isInternational) {
      if (model.includes('A320')) {
        return [1]; // Economy only
      } else if (model.includes('A321')) {
        return isInternational ? [1, 2, 3] : [1, 3]; // Economy + Business, Premium if international
      } else if (model.includes('A350') || model.includes('787')) {
        return [1, 2, 3, 4]; // All classes
      } else if (model.includes('777')) {
        return [1, 2, 3, 4]; // All classes
      }
      return [1]; // Default to economy
    }

    function getSeatCountsForClass(airplaneId, classId, model) {
      // Hardcoded based on our seat layout configuration
      const seatCounts = {
        // A321 - 184 total
        'A321': {
          1: 172, // Economy
          2: 0,   // No premium economy
          3: 12,  // Business
          4: 0    // No first class
        },
        // A350 - 305 total
        'A350': {
          1: 252, // Economy
          2: 21,  // Premium Economy
          3: 28,  // Business
          4: 4    // First Class
        },
        // Boeing 787 - 294 total
        'B787': {
          1: 241, // Economy
          2: 21,  // Premium Economy
          3: 32,  // Business
          4: 0    // No first class
        },
        // A320 - 180 total
        'A320': {
          1: 180, // Economy only
          2: 0, 3: 0, 4: 0
        },
        // Boeing 777 - 346 total
        'B777': {
          1: 282, // Economy
          2: 28,  // Premium Economy
          3: 32,  // Business
          4: 4    // First Class
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
