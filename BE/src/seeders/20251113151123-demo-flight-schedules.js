'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const schedules = [];
    const baseDate = new Date('2025-11-15');

    for (let day = 0; day < 30; day++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + day);

      // DAILY SCHEDULE PATTERN - 35 schedules per day = 1050 total

      // SGN-HAN - 6 flights/day (VN201: 3 flights, VJ101: 3 flights)
      for (let i = 0; i < 3; i++) {
        const hour = 6 + (i * 4); // 6:00, 10:00, 14:00

        // VN201 flight
        const vnDep = new Date(currentDate);
        vnDep.setHours(hour, 0, 0, 0);
        const vnArr = new Date(vnDep);
        vnArr.setHours(vnArr.getHours() + 2, vnArr.getMinutes() + 15);

        schedules.push({
          flight_id: 1, // VN201
          airplane_id: (i % 4) + 1, // Rotate through airplanes 1-4
          departure_time: vnDep,
          arrival_time: vnArr,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // VJ101 flight (45 minutes later)
        const vjDep = new Date(vnDep);
        vjDep.setMinutes(vjDep.getMinutes() + 45);
        const vjArr = new Date(vjDep);
        vjArr.setHours(vjArr.getHours() + 2, vjArr.getMinutes() + 15);

        schedules.push({
          flight_id: 11, // VJ101
          airplane_id: (i % 3) + 5, // Rotate through airplanes 5-7
          departure_time: vjDep,
          arrival_time: vjArr,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // HAN-SGN - 6 return flights/day
      for (let i = 0; i < 3; i++) {
        const hour = 9 + (i * 4); // 9:00, 13:00, 17:00

        // VN202 flight
        const vnDep = new Date(currentDate);
        vnDep.setHours(hour, 0, 0, 0);
        const vnArr = new Date(vnDep);
        vnArr.setHours(vnArr.getHours() + 2, vnArr.getMinutes() + 15);

        schedules.push({
          flight_id: 2, // VN202
          airplane_id: (i % 4) + 1,
          departure_time: vnDep,
          arrival_time: vnArr,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // VJ102 flight
        const vjDep = new Date(vnDep);
        vjDep.setMinutes(vjDep.getMinutes() + 45);
        const vjArr = new Date(vjDep);
        vjArr.setHours(vjArr.getHours() + 2, vjArr.getMinutes() + 15);

        schedules.push({
          flight_id: 12, // VJ102
          airplane_id: (i % 3) + 5,
          departure_time: vjDep,
          arrival_time: vjArr,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // SGN-DAD - 8 flights/day (4 out, 4 return)
      for (let i = 0; i < 4; i++) {
        const hour = 7 + (i * 3); // 7:00, 10:00, 13:00, 16:00

        // SGN to DAD
        const outDep = new Date(currentDate);
        outDep.setHours(hour, 30, 0, 0);
        const outArr = new Date(outDep);
        outArr.setHours(outArr.getHours() + 1, outArr.getMinutes() + 30);

        schedules.push({
          flight_id: 3, // VN301 SGN-DAD
          airplane_id: (i % 4) + 1,
          departure_time: outDep,
          arrival_time: outArr,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // DAD to SGN (3 hours later)
        const retDep = new Date(outArr);
        retDep.setHours(retDep.getHours() + 3);
        const retArr = new Date(retDep);
        retArr.setHours(retArr.getHours() + 1, retArr.getMinutes() + 30);

        schedules.push({
          flight_id: 4, // VN302 DAD-SGN
          airplane_id: (i % 4) + 1,
          departure_time: retDep,
          arrival_time: retArr,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // International flights - 3 schedules every other day
      if (day % 2 === 0) {
        // SGN-BKK
        const intlDep = new Date(currentDate);
        intlDep.setHours(9, 15, 0, 0);
        const intlArr = new Date(intlDep);
        intlArr.setHours(intlArr.getHours() + 1, intlArr.getMinutes() + 45);

        schedules.push({
          flight_id: 25, // VN701 SGN-BKK
          airplane_id: 2, // A350
          departure_time: intlDep,
          arrival_time: intlArr,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // BKK-SGN (return)
        const intlRetDep = new Date(intlArr);
        intlRetDep.setHours(intlRetDep.getHours() + 4);
        const intlRetArr = new Date(intlRetDep);
        intlRetArr.setHours(intlRetArr.getHours() + 1, intlRetArr.getMinutes() + 45);

        schedules.push({
          flight_id: 26, // VN702 BKK-SGN
          airplane_id: 2,
          departure_time: intlRetDep,
          arrival_time: intlRetArr,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Extra international schedule for variety
        const intl2Dep = new Date(currentDate);
        intl2Dep.setHours(21, 45, 0, 0);
        const intl2Arr = new Date(intl2Dep);
        intl2Arr.setHours(intl2Arr.getHours() + 1, intl2Arr.getMinutes() + 45);

        schedules.push({
          flight_id: 31, // TG541 BKK-SGN
          airplane_id: 12, // Boeing 777
          departure_time: intl2Dep,
          arrival_time: intl2Arr,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    console.log(`Total flight schedules created: ${schedules.length}`);
    await queryInterface.bulkInsert('FlightSchedules', schedules, {});
    return schedules.length;
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FlightSchedules', null, {});
  }
};
