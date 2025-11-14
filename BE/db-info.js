require('dotenv').config();

function showDatabaseInfo() {
    console.log('📊 DATABASE CONFIGURATION INFO\n');
    
    console.log('🏠 LOCAL DATABASE (Development):');
    console.log(`   Host: ${process.env.DB_HOST || '127.0.0.1'}`);
    console.log(`   Database: ${process.env.DB_NAME || 'test_db_bf'}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}`);
    console.log(`   Environment: development\n`);
    
    console.log('☁️  RAILWAY DATABASE (Production):');
    console.log(`   Host: ${process.env.RAILWAY_DB_HOST || 'Not set'}`);
    console.log(`   Port: ${process.env.RAILWAY_DB_PORT || 'Not set'}`);
    console.log(`   Database: ${process.env.RAILWAY_DB_NAME || 'Not set'}`);
    console.log(`   User: ${process.env.RAILWAY_DB_USER || 'Not set'}`);
    console.log(`   Environment: production\n`);
    
    console.log('📝 USAGE:');
    console.log('   Local commands: npm run [command]:local');
    console.log('   Railway commands: npm run [command]:railway');
}

showDatabaseInfo();