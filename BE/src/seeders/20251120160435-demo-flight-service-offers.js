'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ✅ Get actual service option IDs
    const [serviceOptions] = await queryInterface.sequelize.query(`
      SELECT so.id, so.code, sc.code as catalog_code
      FROM ServiceOptions so 
      JOIN ServiceCatalogs sc ON so.catalog_id = sc.id
      WHERE sc.status = 'active' AND so.status = 'active'
      ORDER BY so.id ASC
    `);

    // ✅ DEBUG: Log service options
    console.log(`🔍 FOUND SERVICE OPTIONS:`);
    serviceOptions.forEach(opt => {
      console.log(`   ${opt.catalog_code}: ${opt.code} (ID: ${opt.id})`);
    });

    // Group by catalog
    const mealOptions = serviceOptions.filter(s => s.catalog_code === 'MEAL');
    const baggageOptions = serviceOptions.filter(s => s.catalog_code === 'BAGGAGE');
    const insuranceOptions = serviceOptions.filter(s => s.catalog_code === 'INSURANCE');
    const wifiOptions = serviceOptions.filter(s => s.catalog_code === 'WIFI');
    const priorityOptions = serviceOptions.filter(s => s.catalog_code === 'PRIORITY');

    console.log(`📦 BAGGAGE OPTIONS FOUND: ${baggageOptions.length}`);
    baggageOptions.forEach(opt => console.log(`   - ${opt.code}`));

    // ✅ Get ALL flight schedules
    const [schedules] = await queryInterface.sequelize.query(`
      SELECT 
        fs.id as schedule_id, 
        fs.airplane_id,
        a.model,
        f.flight_number,
        dep.iata_code as dep_code,
        arr.iata_code as arr_code,
        dep.country as dep_country,
        arr.country as arr_country,
        CASE 
          WHEN dep.country != 'Vietnam' OR arr.country != 'Vietnam' 
          THEN 'international' 
          ELSE 'domestic' 
        END as route_type
      FROM FlightSchedules fs
      JOIN Flights f ON fs.flight_id = f.id
      JOIN Airplanes a ON fs.airplane_id = a.id  
      JOIN Airports dep ON f.departure_airport_id = dep.id
      JOIN Airports arr ON f.arrival_airport_id = arr.id
      WHERE fs.status = 'scheduled'
      ORDER BY fs.id ASC
    `);

    // ✅ DEBUG: Check route types
    const domesticCount = schedules.filter(s => s.route_type === 'domestic').length;
    const internationalCount = schedules.filter(s => s.route_type === 'international').length;
    
    console.log(`🌍 ROUTE DISTRIBUTION:`);
    console.log(`   - Domestic flights: ${domesticCount}`);
    console.log(`   - International flights: ${internationalCount}`);
    
    if (internationalCount > 0) {
      console.log(`🔍 SAMPLE INTERNATIONAL FLIGHTS:`);
      schedules.filter(s => s.route_type === 'international').slice(0, 3).forEach(s => {
        console.log(`   - ${s.flight_number}: ${s.dep_code} (${s.dep_country}) → ${s.arr_code} (${s.arr_country})`);
      });
    }

    console.log(`🛫 Processing ${schedules.length} flight schedules...`);

    const serviceOffers = [];
    let priceOverrideCount = 0; // Track how many get price override

    for (const schedule of schedules) {
      const isInternational = schedule.route_type === 'international';
      const isWideBody = ['A350', 'B787', 'B777'].some(type => schedule.model.includes(type));
      
      // ===== MEAL SERVICES =====
      mealOptions.forEach(option => {
        let capacity = 50;
        if (isInternational) capacity = 80;
        if (isWideBody) capacity += 30;

        if (option.code === 'MEAL_KIDS') {
          capacity = 20;
        }

        serviceOffers.push({
          flight_schedule_id: schedule.schedule_id,
          service_option_id: option.id,
          price_override: null,
          is_free: false,
          included_quantity: 0,
          capacity: capacity,
          sold_count: Math.floor(Math.random() * capacity * 0.3),
          available_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          available_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'available',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });

      // ===== BAGGAGE SERVICES =====
      baggageOptions.forEach(option => {
        let priceOverride = null;

        // ✅ DEBUG: Log baggage processing
        if (isInternational) {
          console.log(`🧳 Processing baggage for INTERNATIONAL flight ${schedule.flight_number}: ${option.code}`);
          
          switch (option.code) {
            case 'BAGGAGE_5KG':
              priceOverride = 300000;
              break;
            case 'BAGGAGE_10KG':
              priceOverride = 450000;
              break;
            case 'BAGGAGE_15KG':
              priceOverride = 600000;
              break;
            case 'BAGGAGE_20KG':
              priceOverride = 750000;
              break;
            case 'BAGGAGE_25KG':
              priceOverride = 900000;
              break;
            case 'BAGGAGE_30KG':
              priceOverride = 1050000;
              break;
            case 'BAGGAGE_35KG':
              priceOverride = 1200000;
              break;
            case 'BAGGAGE_40KG':
              priceOverride = 1350000;
              break;
            case 'BAGGAGE_5KG_CABIN':
              priceOverride = 225000;
              break;
            case 'BAGGAGE_7KG_CABIN':
              priceOverride = 300000;
              break;
            case 'BAGGAGE_10KG_CABIN':
              priceOverride = 375000;
              break;
            default:
              console.log(`⚠️  Unknown baggage code: ${option.code}`);
          }
          
          if (priceOverride) {
            priceOverrideCount++;
            console.log(`   → Set price override: ${priceOverride} for ${option.code}`);
          }
        }

        serviceOffers.push({
          flight_schedule_id: schedule.schedule_id,
          service_option_id: option.id,
          price_override: priceOverride,
          is_free: false,
          included_quantity: 0,
          capacity: 200,
          sold_count: Math.floor(Math.random() * 200 * 0.4),
          available_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          available_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'available',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });

      // ===== INSURANCE SERVICES =====
      insuranceOptions.forEach(option => {
        let priceOverride = null;
        
        if (isInternational) {
          switch (option.code) {
            case 'INSURANCE_BASIC':
              priceOverride = 250000;
              priceOverrideCount++;
              break;
            case 'INSURANCE_PREMIUM':
              priceOverride = 420000;
              priceOverrideCount++;
              break;
            case 'INSURANCE_FAMILY':
              priceOverride = 650000;
              priceOverrideCount++;
              break;
          }
        }

        serviceOffers.push({
          flight_schedule_id: schedule.schedule_id,
          service_option_id: option.id,
          price_override: priceOverride,
          is_free: false,
          included_quantity: 0,
          capacity: 500,
          sold_count: Math.floor(Math.random() * 500 * 0.1),
          available_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          available_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'available',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });

      // ===== WIFI SERVICES (Only for wide-body aircraft) =====
      if (isWideBody) {
        wifiOptions.forEach(option => {
          serviceOffers.push({
            flight_schedule_id: schedule.schedule_id,
            service_option_id: option.id,
            price_override: null,
            is_free: false,
            included_quantity: 0,
            capacity: 150,
            sold_count: Math.floor(Math.random() * 150 * 0.2),
            available_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            available_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'available',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
      }

      // ===== PRIORITY SERVICES =====
      priorityOptions.forEach(option => {
        let capacity = 50;
        
        switch (option.code) {
          case 'PRIORITY_BOARDING':
            capacity = 50;
            break;
          case 'FAST_TRACK_SECURITY':
            capacity = 30;
            break;
          case 'FAST_TRACK_IMMIGRATION':
            capacity = isInternational ? 25 : 0;
            break;
          case 'LOUNGE_ACCESS':
            capacity = 40;
            break;
        }

        if (capacity > 0) {
          serviceOffers.push({
            flight_schedule_id: schedule.schedule_id,
            service_option_id: option.id,
            price_override: null,
            is_free: false,
            included_quantity: 0,
            capacity: capacity,
            sold_count: Math.floor(Math.random() * capacity * 0.3),
            available_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            available_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'available',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      });
    }

    // ✅ Bulk insert with progress tracking
    const batchSize = 1000;
    let totalInserted = 0;

    for (let i = 0; i < serviceOffers.length; i += batchSize) {
      const batch = serviceOffers.slice(i, i + batchSize);
      await queryInterface.bulkInsert('FlightServiceOffers', batch, {});
      totalInserted += batch.length;
      console.log(`📦 Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(serviceOffers.length / batchSize)} (${totalInserted}/${serviceOffers.length} records)`);
    }

    // ✅ Summary statistics
    const domesticFlights = schedules.filter(s => s.route_type === 'domestic').length;
    const internationalFlights = schedules.filter(s => s.route_type === 'international').length;
    const wideBodyFlights = schedules.filter(s => ['A350', 'B787', 'B777'].some(type => s.model.includes(type))).length;

    console.log(`✅ FlightServiceOffers seeder completed!`);
    console.log(`📊 STATISTICS:`);
    console.log(`   - Total flight schedules: ${schedules.length}`);
    console.log(`   - Domestic flights: ${domesticFlights}`);
    console.log(`   - International flights: ${internationalFlights}`);
    console.log(`   - Wide-body aircraft: ${wideBodyFlights}`);
    console.log(`   - Total service offers: ${serviceOffers.length}`);
    console.log(`   - Records with price_override: ${priceOverrideCount}`);
    console.log(`   - Average services per flight: ${Math.round(serviceOffers.length / schedules.length)}`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FlightServiceOffers', null, {});
    console.log('✅ FlightServiceOffers data cleared');
  }
};