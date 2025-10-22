const express = require('express');
const {PORT} = require('./config');
const apiRouter = require('./routes');

const app = express();

app.use('/api', apiRouter);


app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});