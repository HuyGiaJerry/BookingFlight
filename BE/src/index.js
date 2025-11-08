const express = require('express');
const { StatusCodes } = require('http-status-codes');
const { ServerConfig, Logger } = require('./config');
const apiRouter = require('./routes');
const { ErrorHandler } = require('./middlewares');
var cookieParser = require('cookie-parser');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', apiRouter);



// middleware xử lý lỗi
app.use(ErrorHandler);


app.listen(ServerConfig.PORT, () => {
    console.log(`Server is running on port: ${ServerConfig.PORT}`);
    // Logger.info("Successfully started the server", "root", {});
});