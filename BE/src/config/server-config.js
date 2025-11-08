const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    PORT: process.env.PORT || 3600,
    DB: {
        HOST: process.env.DB_HOST || '127.0.0.1',
        USER: process.env.DB_USER || 'root',
        PASS: process.env.DB_PASS || '',
        NAME: process.env.DB_NAME || 'test_db_bf',
        DIALECT: process.env.DB_DIALECT || 'mysql'
    }
}