const {StatusCodes} = require('http-status-codes');

const home = (req, res) => {
    res
    .status(StatusCodes.OK)
    .json({
        message: "Welcome to the Home Page",
        error:{},
        data:{}
    })
};

module.exports = {
    home
};