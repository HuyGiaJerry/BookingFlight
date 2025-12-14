require('dotenv').config();
const express = require('express');
const { SeatCleanupService } = require('./services');
const apiRouter = require('./routes');
const { ErrorHandler } = require('./middlewares');
const initSeatSelectionSocket = require('./socket/seat-selection-socket');
const cookieParser = require('cookie-parser');
const { xss } = require('express-xss-sanitizer');
const http = require('http');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const server = http.createServer(app);  // <-- SERVER CHÍNH

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(xss());

const allowedOrigins = [
    process.env.FRONTEND_URL_DEV?.trim(),
    process.env.FRONTEND_URL_DEPLOY?.trim(),
    "http://localhost:3001"
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            console.log("❌ Blocked by CORS:", origin);
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

// --- IMPORTANT: Socket.IO attach vào server ---
initSeatSelectionSocket(server);

app.use('/api', apiRouter);
app.use(ErrorHandler);

// --- START SERVER (Express + Socket.io) ---
server.listen(process.env.PORT || 3600, async () => {
    console.log(`🚀 Server + Socket.IO running on port ${process.env.PORT || 3600}`);

    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        const seatCleanupService = new SeatCleanupService();
        seatCleanupService.startAutoCleanup();
        global.seatCleanupService = seatCleanupService;

    } catch (error) {
        console.error('❌ DB connection err:', error.message);
        process.exit(1);
    }
});
