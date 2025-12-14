'use strict';

// Load environment variables from .env file
require('dotenv').config();

module.exports = {
    "development": {
        // ✅ FIXED: Use LOCAL database for development
        "username": process.env.DB_USER || "root",
        "password": process.env.DB_PASS || "123456",
        "database": process.env.DB_NAME || "test_db_bf",
        "host": process.env.DB_HOST || "127.0.0.1",
        "port": process.env.DB_PORT || 3306,
        "dialect": process.env.DB_DIALECT || "mysql",
        "logging": console.log, // Enable SQL query logging
        "define": {
            "timestamps": true,
            "underscored": false,
            "freezeTableName": true
        },
        "pool": {
            "max": 10,
            "min": 0,
            "acquire": 30000,
            "idle": 10000
        }
    },
    "test": {
        "username": process.env.DB_USER || "root",
        "password": process.env.DB_PASS || "123456",
        "database": process.env.DB_NAME_TEST || "test_db_bf_test",
        "host": process.env.DB_HOST || "127.0.0.1",
        "port": process.env.DB_PORT || 3306,
        "dialect": process.env.DB_DIALECT || "mysql",
        "logging": false
    },
    "production": {
        // ✅ RAILWAY config for production
        "username": process.env.RAILWAY_DB_USER,
        "password": process.env.RAILWAY_DB_PASSWORD,
        "database": process.env.RAILWAY_DB_NAME,
        "host": process.env.RAILWAY_DB_HOST,
        "port": process.env.RAILWAY_DB_PORT || 3306,
        "dialect": process.env.DB_DIALECT || "mysql",
        "dialectOptions": {
            "ssl": {
                "rejectUnauthorized": false
            }
        },
        "logging": false,
        "define": {
            "timestamps": true,
            "underscored": false,
            "freezeTableName": true
        },
        "pool": {
            "max": 20,
            "min": 2,
            "acquire": 60000,
            "idle": 10000
        }
    }
};