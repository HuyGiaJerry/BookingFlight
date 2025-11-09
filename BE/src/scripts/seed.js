const { User, Flight, FlightSchedule, Seat, Airplane, Airline, Airport, FlightScheduleFare, AirplaneSeatLayout } = require('../models');

async function seedDatabase() {
  try {
        // 🔹 1️⃣ Airports
    const airports = await Airport.bulkCreate([
      { name: 'Tan Son Nhat Airport', iata_code: 'SGN', city: 'Ho Chi Minh', country: 'Vietnam' },
      { name: 'Noi Bai Airport', iata_code: 'HAN', city: 'Hanoi', country: 'Vietnam' }
    ], { returning: true });

    // 🔹 2️⃣ Airlines
    const airlines = await Airline.bulkCreate([
      { name: 'Vietnam Airlines', code: 'VN' },
      { name: 'VietJet Air', code: 'VJ' }
    ], { returning: true });

    // 🔹 3️⃣ Airplanes
    const airplanes = await Airplane.bulkCreate([
      { airline_id: airlines[0].id, model: 'Boeing 787', seat_capacity: 4 },
      { airline_id: airlines[1].id, model: 'Airbus A320', seat_capacity: 4 }
    ], { returning: true });

    // 🔹 4️⃣ AirplaneSeatLayout
    const layouts = await AirplaneSeatLayout.bulkCreate([
      { airplane_id: airplanes[0].id, seat_number: '1A', seat_type: 'business', seat_position: 'window' },
      { airplane_id: airplanes[0].id, seat_number: '1B', seat_type: 'business', seat_position: 'aisle' },
      { airplane_id: airplanes[0].id, seat_number: '2A', seat_type: 'economy', seat_position: 'window' },
      { airplane_id: airplanes[0].id, seat_number: '2B', seat_type: 'economy', seat_position: 'aisle' },
      { airplane_id: airplanes[1].id, seat_number: '1A', seat_type: 'business', seat_position: 'window' },
      { airplane_id: airplanes[1].id, seat_number: '1B', seat_type: 'business', seat_position: 'aisle' },
      { airplane_id: airplanes[1].id, seat_number: '2A', seat_type: 'economy', seat_position: 'window' },
      { airplane_id: airplanes[1].id, seat_number: '2B', seat_type: 'economy', seat_position: 'aisle' }
    ], { returning: true });

    // 🔹 5️⃣ Flights
    const flights = await Flight.bulkCreate([
      // Chiều đi
      { flight_number: 'VN101', departure_airport_id: airports[0].id, arrival_airport_id: airports[1].id, airplane_id: airplanes[0].id, duration: 120, base_price: 100, flight_status: 'scheduled' },
      { flight_number: 'VJ202', departure_airport_id: airports[0].id, arrival_airport_id: airports[1].id, airplane_id: airplanes[1].id, duration: 110, base_price: 80, flight_status: 'scheduled' },
      // Chiều về
      { flight_number: 'VN101-REV', departure_airport_id: airports[1].id, arrival_airport_id: airports[0].id, airplane_id: airplanes[0].id, duration: 120, base_price: 100, flight_status: 'scheduled' },
      { flight_number: 'VJ202-REV', departure_airport_id: airports[1].id, arrival_airport_id: airports[0].id, airplane_id: airplanes[1].id, duration: 110, base_price: 80, flight_status: 'scheduled' }
    ], { returning: true });

    // 🔹 6️⃣ FlightSchedules
    const schedules = await FlightSchedule.bulkCreate([
      { flight_id: flights[0].id, departure_time: '2025-11-10 08:00:00', arrival_time: '2025-11-10 10:00:00', price: 100, available_seat: 4, flight_schedule_status: 'active' },
      { flight_id: flights[1].id, departure_time: '2025-11-10 09:00:00', arrival_time: '2025-11-10 11:00:00', price: 80, available_seat: 4, flight_schedule_status: 'active' },
      { flight_id: flights[2].id, departure_time: '2025-11-15 15:00:00', arrival_time: '2025-11-15 17:00:00', price: 100, available_seat: 4, flight_schedule_status: 'active' },
      { flight_id: flights[3].id, departure_time: '2025-11-15 16:00:00', arrival_time: '2025-11-15 18:00:00', price: 80, available_seat: 4, flight_schedule_status: 'active' }
    ], { returning: true });

    // 🔹 7️⃣ FlightScheduleFares
    await FlightScheduleFare.bulkCreate([
      { flight_schedule_id: schedules[0].id, class_type: 'economy', price: 100, seat_allocated: 2 },
      { flight_schedule_id: schedules[0].id, class_type: 'business', price: 200, seat_allocated: 2 },
      { flight_schedule_id: schedules[1].id, class_type: 'economy', price: 80, seat_allocated: 2 },
      { flight_schedule_id: schedules[1].id, class_type: 'business', price: 160, seat_allocated: 2 },
      { flight_schedule_id: schedules[2].id, class_type: 'economy', price: 100, seat_allocated: 2 },
      { flight_schedule_id: schedules[2].id, class_type: 'business', price: 200, seat_allocated: 2 },
      { flight_schedule_id: schedules[3].id, class_type: 'economy', price: 80, seat_allocated: 2 },
      { flight_schedule_id: schedules[3].id, class_type: 'business', price: 160, seat_allocated: 2 }
    ]);

    // 🔹 8️⃣ Seats
    const seatEntries = [];
    schedules.forEach((schedule, i) => {
      const planeLayouts = i % 2 === 0 ? layouts.slice(0,4) : layouts.slice(4,8); // ghép layout theo máy bay
      planeLayouts.forEach(layout => {
        seatEntries.push({ flight_schedule_id: schedule.id, layout_id: layout.id, seat_status: 'available' });
      });
    });
    await Seat.bulkCreate(seatEntries);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase();
