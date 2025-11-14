// Load Railway environment variables
require('dotenv').config({ path: '.env' });

const mysql = require('mysql2/promise');

async function testRailwayConnection() {
    const config = {
        host: process.env.RAILWAY_DB_HOST,
        port: parseInt(process.env.RAILWAY_DB_PORT),
        user: process.env.RAILWAY_DB_USER,
        password: process.env.RAILWAY_DB_PASSWORD,
        database: process.env.RAILWAY_DB_NAME,
        ssl: {
            rejectUnauthorized: false
        }
    };

    console.log('🚂 Testing Railway MySQL Connection...');
    console.log('📊 Config:', {
        host: config.host,
        port: config.port,
        user: config.user,
        database: config.database,
        password: config.password ? '***hidden***' : 'NOT SET'
    });

    try {
        // ✅ STEP 1: Connect without specific database first
        const connectionConfigWithoutDB = {
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            ssl: {
                rejectUnauthorized: false
            }
        };

        console.log('🔧 Connecting to MySQL server...');
        const connection = await mysql.createConnection(connectionConfigWithoutDB);
        console.log('✅ Connected to MySQL server!');

        // ✅ STEP 2: Check existing databases
        const [databases] = await connection.execute('SHOW DATABASES');
        console.log('📋 Available databases:', databases.map(db => db.Database));

        const dbExists = databases.some(db => db.Database === config.database);
        console.log(`🎯 Target database '${config.database}' exists: ${dbExists}`);

        // ✅ STEP 3: Create database if not exists
        if (!dbExists) {
            console.log(`🔧 Creating database '${config.database}'...`);
            await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            console.log('✅ Database created successfully!');
        }

        // ✅ STEP 4: Connect to the specific database
        await connection.changeUser({ database: config.database });
        console.log(`✅ Connected to database '${config.database}'!`);

        // ✅ STEP 5: Test basic queries - FIXED SQL syntax
        const [rows] = await connection.execute('SELECT DATABASE() as current_db, VERSION() as mysql_version, NOW() as current_datetime');
        console.log('🎯 Database info:', rows[0]);

        // ✅ STEP 6: Test table operations
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS connection_test (
                id INT PRIMARY KEY AUTO_INCREMENT,
                message VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Test table created successfully!');

        // Insert test data
        await connection.execute(
            'INSERT INTO connection_test (message) VALUES (?)',
            ['Railway connection test successful at ' + new Date().toISOString()]
        );
        console.log('✅ Test data inserted successfully!');

        // Query test data
        const [testData] = await connection.execute('SELECT * FROM connection_test ORDER BY id DESC LIMIT 1');
        console.log('📄 Latest test record:', testData[0]);

        // Test count
        const [countResult] = await connection.execute('SELECT COUNT(*) as total_tests FROM connection_test');
        console.log('📊 Total test records:', countResult[0].total_tests);

        // Clean up
        await connection.execute('DROP TABLE connection_test');
        console.log('🧹 Test table cleaned up!');

        await connection.end();
        console.log('🎉 Railway MySQL connection test completed successfully!');
        return true;

    } catch (error) {
        console.error('❌ Railway connection failed:', error.message);
        console.error('🔍 Error details:', {
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sql: error.sql
        });
        return false;
    }
}

// Test with Sequelize
async function testSequelizeRailway() {
    console.log('\n🔧 Testing Sequelize with Railway...');

    // Set NODE_ENV to production to use Railway config
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    // Clear require cache to ensure fresh config load
    Object.keys(require.cache).forEach(key => {
        if (key.includes('/models/') || key.includes('\\models\\') || key.includes('/config/') || key.includes('\\config\\')) {
            delete require.cache[key];
        }
    });

    try {
        const { sequelize } = require('./src/models');

        console.log('🔧 Sequelize attempting connection...');
        console.log('🔧 Using config:', {
            database: sequelize.config.database,
            host: sequelize.config.host,
            port: sequelize.config.port,
            username: sequelize.config.username
        });

        await sequelize.authenticate();
        console.log('✅ Sequelize Railway connection successful!');

        const [results] = await sequelize.query('SELECT DATABASE() as db, CONNECTION_ID() as conn_id, USER() as user_info');
        console.log('🎯 Sequelize query result:', results[0]);

        // Test create table
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS sequelize_test (
                id INT PRIMARY KEY AUTO_INCREMENT,
                message VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Sequelize table test successful!');

        // Clean up
        await sequelize.query('DROP TABLE IF EXISTS sequelize_test');
        console.log('🧹 Sequelize test cleaned up!');

        await sequelize.close();
        return true;

    } catch (error) {
        console.error('❌ Sequelize Railway connection failed:', error.message);
        console.error('🔍 Sequelize error details:', error.original || error);
        return false;
    } finally {
        // Restore original NODE_ENV
        process.env.NODE_ENV = originalEnv;
    }
}

// Run tests
async function runAllTests() {
    console.log('🚀 Starting Railway Database Tests...\n');

    const rawTest = await testRailwayConnection();
    console.log('\n' + '='.repeat(50) + '\n');

    if (rawTest) {
        const sequelizeTest = await testSequelizeRailway();

        console.log('\n📊 Test Summary:');
        console.log(`Raw MySQL connection: ${rawTest ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Sequelize connection: ${sequelizeTest ? '✅ PASS' : '❌ FAIL'}`);

        if (rawTest && sequelizeTest) {
            console.log('\n🎉 All tests passed! Railway database is ready for migration.');
            console.log('\n📝 Next steps:');
            console.log('1. Run: npm run db:migrate:railway');
            console.log('2. Run: npm run db:seed:railway');
        } else if (rawTest) {
            console.log('\n⚠️  Raw connection works but Sequelize failed. Check config.js');
        }
    } else {
        console.log('\n📊 Test Summary:');
        console.log('Raw MySQL connection: ❌ FAIL');
        console.log('⚠️ Cannot proceed with Sequelize test.');
    }
}

runAllTests();