const express = require('express');
const { StatusCodes } = require('http-status-codes');
const { ServerConfig, Logger } = require('./config');
const apiRouter = require('./routes');
const { ErrorHandler } = require('./middlewares');
var cookieParser = require('cookie-parser');
const app = express();
const { sequelize } = require('./models');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', apiRouter);



// middleware xử lý lỗi
app.use(ErrorHandler);



app.listen(ServerConfig.PORT, async () => {
    console.log(`🚀 Server is running on port ${ServerConfig.PORT}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Database: ${sequelize.config.database} @ ${sequelize.config.host}:${sequelize.config.port || 3306}`);
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully!');
    } catch (error) {
        console.error('❌ Unable to connect to database:', error.message);
    }
    // Logger.info("Successfully started the server", "root", {});
});