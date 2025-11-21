'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // ✅ Get catalog IDs dynamically
    const [catalogs] = await queryInterface.sequelize.query(`
      SELECT id, code FROM ServiceCatalogs WHERE status = 'active' ORDER BY id ASC
    `);

    // Create lookup map
    const catalogMap = {};
    catalogs.forEach(cat => {
      catalogMap[cat.code] = cat.id;
    });

    await queryInterface.bulkInsert('ServiceOptions', [
      // ===== MEAL OPTIONS =====
      {
        catalog_id: catalogMap['MEAL'],
        code: 'MEAL_CHICKEN_RICE',
        title: 'Grilled Chicken with Rice',
        description: 'Tender grilled chicken served with jasmine rice and vegetables',
        price: 180000,
        extra_meta: JSON.stringify({
          dietary: ['halal'],
          weight: '350g',
          ingredients: ['chicken', 'rice', 'vegetables'],
          allergens: ['gluten'],
          image_url: 'https://example.com/meals/chicken-rice.jpg'
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['MEAL'],
        code: 'MEAL_BEEF_NOODLES',
        title: 'Beef Pho',
        description: 'Traditional Vietnamese beef noodle soup',
        price: 220000,
        extra_meta: JSON.stringify({
          dietary: ['halal'],
          weight: '400g',
          ingredients: ['beef', 'noodles', 'herbs'],
          allergens: ['gluten'],
          spicy_level: 0,
          image_url: 'https://example.com/meals/beef-pho.jpg'
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['MEAL'],
        code: 'MEAL_VEGETARIAN',
        title: 'Vegetarian Delight',
        description: 'Mixed vegetables with tofu and brown rice',
        price: 150000,
        extra_meta: JSON.stringify({
          dietary: ['vegetarian', 'vegan'],
          weight: '320g',
          ingredients: ['tofu', 'vegetables', 'brown_rice'],
          allergens: ['soy'],
          image_url: 'https://example.com/meals/vegetarian.jpg'
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['MEAL'],
        code: 'MEAL_SEAFOOD',
        title: 'Grilled Fish with Lemon',
        description: 'Fresh grilled fish fillet with lemon butter sauce',
        price: 280000,
        extra_meta: JSON.stringify({
          dietary: ['pescatarian'],
          weight: '380g',
          ingredients: ['fish', 'lemon', 'butter', 'vegetables'],
          allergens: ['fish', 'dairy'],
          image_url: 'https://example.com/meals/grilled-fish.jpg'
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['MEAL'],
        code: 'MEAL_KIDS',
        title: 'Kids Special Meal',
        description: 'Chicken nuggets with fries and juice box',
        price: 120000,
        extra_meta: JSON.stringify({
          dietary: ['kids'],
          weight: '250g',
          ingredients: ['chicken_nuggets', 'fries', 'juice'],
          allergens: ['gluten', 'dairy'],
          age_range: '2-12',
          image_url: 'https://example.com/meals/kids-meal.jpg'
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // ===== BAGGAGE OPTIONS - CHECKED BAGGAGE =====
      {
        catalog_id: catalogMap['BAGGAGE'],
        code: 'BAGGAGE_5KG',
        title: '5kg Extra Baggage',
        description: 'Additional 5kg checked baggage allowance',
        price: 200000,
        extra_meta: JSON.stringify({
          weight: '5kg',
          type: 'checked',
          dimensions: '158cm total',
          restrictions: ['No dangerous goods'],
          applicable_routes: ['domestic', 'international']
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['BAGGAGE'],
        code: 'BAGGAGE_10KG',
        title: '10kg Extra Baggage',
        description: 'Additional 10kg checked baggage allowance',
        price: 300000,
        extra_meta: JSON.stringify({
          weight: '10kg',
          type: 'checked',
          dimensions: '158cm total',
          restrictions: ['No dangerous goods'],
          applicable_routes: ['domestic', 'international']
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['BAGGAGE'],
        code: 'BAGGAGE_15KG',
        title: '15kg Extra Baggage',
        description: 'Additional 15kg checked baggage allowance',
        price: 400000,
        extra_meta: JSON.stringify({
          weight: '15kg',
          type: 'checked',
          dimensions: '158cm total',
          restrictions: ['No dangerous goods'],
          applicable_routes: ['domestic', 'international']
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['BAGGAGE'],
        code: 'BAGGAGE_20KG',
        title: '20kg Extra Baggage',
        description: 'Additional 20kg checked baggage allowance',
        price: 500000,
        extra_meta: JSON.stringify({
          weight: '20kg',
          type: 'checked',
          dimensions: '158cm total',
          restrictions: ['No dangerous goods'],
          applicable_routes: ['domestic', 'international']
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['BAGGAGE'],
        code: 'BAGGAGE_25KG',
        title: '25kg Extra Baggage',
        description: 'Additional 25kg checked baggage allowance',
        price: 600000,
        extra_meta: JSON.stringify({
          weight: '25kg',
          type: 'checked',
          dimensions: '158cm total',
          restrictions: ['No dangerous goods'],
          applicable_routes: ['domestic', 'international']
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['BAGGAGE'],
        code: 'BAGGAGE_30KG',
        title: '30kg Extra Baggage',
        description: 'Additional 30kg checked baggage allowance',
        price: 700000,
        extra_meta: JSON.stringify({
          weight: '30kg',
          type: 'checked',
          dimensions: '158cm total',
          restrictions: ['No dangerous goods'],
          applicable_routes: ['domestic', 'international']
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['BAGGAGE'],
        code: 'BAGGAGE_35KG',
        title: '35kg Extra Baggage',
        description: 'Additional 35kg checked baggage allowance',
        price: 800000,
        extra_meta: JSON.stringify({
          weight: '35kg',
          type: 'checked',
          dimensions: '158cm total',
          restrictions: ['No dangerous goods'],
          applicable_routes: ['domestic', 'international']
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['BAGGAGE'],
        code: 'BAGGAGE_40KG',
        title: '40kg Extra Baggage',
        description: 'Additional 40kg checked baggage allowance',
        price: 900000,
        extra_meta: JSON.stringify({
          weight: '40kg',
          type: 'checked',
          dimensions: '158cm total',
          restrictions: ['No dangerous goods'],
          applicable_routes: ['domestic', 'international']
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // ===== CABIN BAGGAGE OPTIONS =====
      {
        catalog_id: catalogMap['BAGGAGE'],
        code: 'BAGGAGE_5KG_CABIN',
        title: '5kg Cabin Baggage',
        description: 'Additional 5kg cabin baggage allowance',
        price: 150000,
        extra_meta: JSON.stringify({
          weight: '5kg',
          type: 'cabin',
          dimensions: '56x36x23cm',
          restrictions: ['Liquid restrictions apply'],
          applicable_routes: ['domestic', 'international']
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['BAGGAGE'],
        code: 'BAGGAGE_7KG_CABIN',
        title: '7kg Cabin Baggage',
        description: 'Additional 7kg cabin baggage allowance',
        price: 200000,
        extra_meta: JSON.stringify({
          weight: '7kg',
          type: 'cabin',
          dimensions: '56x36x23cm',
          restrictions: ['Liquid restrictions apply'],
          applicable_routes: ['domestic', 'international']
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['BAGGAGE'],
        code: 'BAGGAGE_10KG_CABIN',
        title: '10kg Cabin Baggage',
        description: 'Additional 10kg cabin baggage allowance',
        price: 250000,
        extra_meta: JSON.stringify({
          weight: '10kg',
          type: 'cabin',
          dimensions: '56x36x23cm',
          restrictions: ['Liquid restrictions apply'],
          applicable_routes: ['domestic', 'international']
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // ===== INSURANCE OPTIONS =====
      {
        catalog_id: catalogMap['INSURANCE'],
        code: 'INSURANCE_BASIC',
        title: 'Basic Travel Protection',
        description: 'Coverage for trip cancellation and medical emergencies',
        price: 150000,
        extra_meta: JSON.stringify({
          coverage_type: 'basic',
          max_coverage: 50000000,
          benefits: [
            'Trip cancellation up to 100% of trip cost',
            'Medical emergency up to 50,000,000 VND',
            'Baggage loss up to 5,000,000 VND'
          ],
          exclusions: ['Pre-existing conditions', 'High-risk activities'],
          duration: 'trip_duration'
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['INSURANCE'],
        code: 'INSURANCE_PREMIUM',
        title: 'Premium Travel Protection',
        description: 'Comprehensive coverage including trip interruption',
        price: 280000,
        extra_meta: JSON.stringify({
          coverage_type: 'premium',
          max_coverage: 100000000,
          benefits: [
            'Trip cancellation up to 100% of trip cost',
            'Medical emergency up to 100,000,000 VND',
            'Baggage loss up to 10,000,000 VND',
            'Flight delay compensation',
            'Emergency evacuation'
          ],
          exclusions: ['Pre-existing conditions'],
          duration: 'trip_duration'
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['INSURANCE'],
        code: 'INSURANCE_FAMILY',
        title: 'Family Travel Protection',
        description: 'Comprehensive family coverage for up to 6 members',
        price: 450000,
        extra_meta: JSON.stringify({
          coverage_type: 'family',
          max_coverage: 150000000,
          max_members: 6,
          benefits: [
            'Trip cancellation up to 100% of trip cost',
            'Medical emergency up to 150,000,000 VND total',
            'Baggage loss up to 15,000,000 VND',
            'Flight delay compensation',
            'Emergency evacuation',
            'Child care benefits'
          ],
          exclusions: ['Pre-existing conditions'],
          duration: 'trip_duration'
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // ===== WIFI OPTIONS =====
      {
        catalog_id: catalogMap['WIFI'],
        code: 'WIFI_BASIC',
        title: 'Basic WiFi Package',
        description: 'Basic internet access for messaging and browsing',
        price: 120000,
        extra_meta: JSON.stringify({
          speed: '1Mbps',
          data_limit: '100MB',
          duration: 'full_flight',
          restrictions: ['No streaming', 'No video calls'],
          devices: 1
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['WIFI'],
        code: 'WIFI_PREMIUM',
        title: 'Premium WiFi Package',
        description: 'High-speed internet for streaming and video calls',
        price: 250000,
        extra_meta: JSON.stringify({
          speed: '5Mbps',
          data_limit: 'unlimited',
          duration: 'full_flight',
          restrictions: [],
          devices: 3,
          features: ['HD streaming', 'Video calls', 'File downloads']
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['WIFI'],
        code: 'WIFI_ULTRA',
        title: 'Ultra WiFi Package',
        description: 'Ultra-fast internet with unlimited data and multiple devices',
        price: 380000,
        extra_meta: JSON.stringify({
          speed: '10Mbps',
          data_limit: 'unlimited',
          duration: 'full_flight',
          restrictions: [],
          devices: 5,
          features: ['4K streaming', 'Video calls', 'File downloads', 'Gaming support']
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // ===== PRIORITY SERVICES =====
      {
        catalog_id: catalogMap['PRIORITY'],
        code: 'PRIORITY_BOARDING',
        title: 'Priority Boarding',
        description: 'Board the aircraft before general passengers',
        price: 100000,
        extra_meta: JSON.stringify({
          boarding_group: 'priority',
          benefits: ['Early boarding', 'Extra overhead bin space'],
          restrictions: ['Must arrive at gate on time']
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['PRIORITY'],
        code: 'FAST_TRACK_SECURITY',
        title: 'Fast Track Security',
        description: 'Skip the queue at airport security checkpoints',
        price: 200000,
        extra_meta: JSON.stringify({
          service_type: 'fast_track',
          benefits: ['Dedicated security lane', 'Reduced waiting time'],
          availability: ['Available at major airports'],
          restrictions: ['Must have valid boarding pass']
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['PRIORITY'],
        code: 'FAST_TRACK_IMMIGRATION',
        title: 'Fast Track Immigration',
        description: 'Express immigration clearance service',
        price: 300000,
        extra_meta: JSON.stringify({
          service_type: 'fast_track',
          benefits: ['Dedicated immigration lane', 'Express processing'],
          availability: ['Available at international airports'],
          restrictions: ['Valid passport and visa required']
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        catalog_id: catalogMap['PRIORITY'],
        code: 'LOUNGE_ACCESS',
        title: 'Airport Lounge Access',
        description: 'Access to premium airport lounges',
        price: 500000,
        extra_meta: JSON.stringify({
          service_type: 'lounge',
          benefits: ['Comfortable seating', 'Complimentary food & drinks', 'Free WiFi', 'Quiet environment'],
          availability: ['Available at major airports'],
          restrictions: ['Valid boarding pass required', 'Subject to capacity']
        }),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    console.log('✅ ServiceOptions seeder completed: 24 service options created');
    console.log('   - 5 Meal options');
    console.log('   - 11 Baggage options (8 checked + 3 cabin)'); 
    console.log('   - 3 Insurance options');
    console.log('   - 3 WiFi options');
    console.log('   - 4 Priority service options');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ServiceOptions', null, {});
  }
};