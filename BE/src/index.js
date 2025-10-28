const express = require('express');
const {PORT} = require('./config');
const apiRouter = require('./routes');
var cookieParser = require('cookie-parser');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', apiRouter);


app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});