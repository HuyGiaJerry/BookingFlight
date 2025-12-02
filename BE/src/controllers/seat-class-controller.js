const {SeatClassService} = require('../services');
const {StatusCodes} = require('http-status-codes');
const {Responses} = require('../utils/common');
const seatClassService = new SeatClassService();


async function getAllSeatClasses(req, res,next) {
    try {
        const seatClasses = await seatClassService.getAllSeatClasses();
        return res.status(StatusCodes.OK).json(Responses.SuccessResponse(seatClasses, 'Seat classes retrieved successfully', StatusCodes.OK));
    } catch (error) {           
        next(error);
    }
}

module.exports = {
    getAllSeatClasses
};