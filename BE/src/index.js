require('dotenv').config();
const express = require('express');
const { ServerConfig, Logger } = require('./config');
const { SeatCleanupService } = require('./services')
const apiRouter = require('./routes');
const { ErrorHandler } = require('./middlewares');
const { ProtectedRoutes } = require('./middlewares')
var cookieParser = require('cookie-parser');
const { xss } = require('express-xss-sanitizer');
const app = express();
const { sequelize } = require('./models');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(xss());  
const cors = require('cors');

const allowedOrigins = [
    process.env.FRONTEND_URL_DEV?.trim(),
    process.env.FRONTEND_URL_DEPLOY?.trim(),
    "http://localhost:3001"
].filter(Boolean);

// CORS — FIX QUAN TRỌNG
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log("❌ Blocked by CORS:", origin);
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);
app.use('/api', apiRouter);
// middleware xử lý lỗi
app.use(ErrorHandler);


app.listen(process.env.PORT || 3600, async () => {
    console.log(`🚀 Server is running on port ${process.env.PORT || 3600}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Database: ${sequelize.config.database} @ ${sequelize.config.host}:${sequelize.config.port || 3306}`);
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully!');
        // ✅ THÊM: Start auto-cleanup service AFTER database connection
        // console.log('🧹 Starting seat cleanup service...');
        // const seatCleanupService = new SeatCleanupService();
        // seatCleanupService.startAutoCleanup();

        // // Store globally để có thể stop khi shutdown
        // global.seatCleanupService = seatCleanupService;
    } catch (error) {
        console.error('❌ Unable to connect to database:', error.message);
        process.exit(1); // thoát ứng dụng nếu không kết nối được DB
    }
    // Logger.info("Successfully started the server", "root", {});
});

// // ✅ THÊM: Graceful shutdown handlers
// process.on('SIGTERM', () => {
//     console.log('📋 SIGTERM received, shutting down gracefully...');
//     if (global.seatCleanupService) {
//         global.seatCleanupService.stopAutoCleanup();
//     }
//     process.exit(0);
// });

// process.on('SIGINT', () => {
//     console.log('📋 SIGINT received (Ctrl+C), shutting down gracefully...');
//     if (global.seatCleanupService) {
//         global.seatCleanupService.stopAutoCleanup();
//     }
//     process.exit(0);
// });

// // ✅ THÊM: Handle uncaught exceptions
// process.on('uncaughtException', (error) => {
//     console.error('❌ Uncaught Exception:', error);
//     if (global.seatCleanupService) {
//         global.seatCleanupService.stopAutoCleanup();
//     }
//     process.exit(1);

// });