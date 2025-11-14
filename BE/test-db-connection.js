require('dotenv').config();
const { sequelize } = require('./src/models');

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully!');
        console.log(`📊 Connected to: ${sequelize.config.database}`);
        console.log(`🏠 Host: ${sequelize.config.host}`);
        console.log(`👤 User: ${sequelize.config.username}`);

        // Test query
        const [results] = await sequelize.query('SELECT DATABASE() as current_db');
        console.log(`🎯 Current database: ${results[0].current_db}`);

    } catch (error) {
        console.error('❌ Unable to connect to the database:', error.message);
        console.error('Details:', error);
    } finally {
        await sequelize.close();
    }
}

testConnection();