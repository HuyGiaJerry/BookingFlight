const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const { AirlineService } = require('../services');
const {Responses} = require('../utils/common');

const airlineService = new AirlineService();

async function createAirline(req, res, next) {
    try {
        const newAirline = await airlineService.createAirline(req.body);
        return res
            .status(StatusCodes.CREATED)
            .json(Responses.SuccessResponse(newAirline,'Airline created successfully'));
    } catch (error) {
        next(error);
    }
}


async function getAllAirlines(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const order = [['id', 'ASC']];
        const airlines = await airlineService.getAllAirlines(page, limit);
        
        return res
            .status(StatusCodes.OK)
            .json(Responses.PaginationResponse(airlines.items, airlines.pagination,'Airlines retrieved successfully'));
    } catch (error) {
        next(error);
    }
}


async function getAirlineById(req, res, next) {
    try {
        const airline = await airlineService.getAirlineById(req.params.id);
        return res
            .status(StatusCodes.OK)
            .json(Responses.SuccessResponse(airline,'Airline retrieved successfully'));
    } catch (error) {
        next(error);
    }
}

async function updateAirline(req, res,next) {
    try {
        const updatedAirline = await airlineService.updateAirline(req.params.id, req.body);
        return res
            .status(StatusCodes.OK)
            .json(Responses.SuccessResponse(updatedAirline,'Airline updated successfully'));
    } catch (error) {
        next(error);
    }
}

async function deleteAirline(req, res, next) {
    try {
        await airlineService.deleteAirline(req.params.id);
        return res
            .status(StatusCodes.NO_CONTENT)
            .json(Responses.SuccessResponse(null,'Airline deleted successfully'));
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createAirline,
    getAllAirlines,
    getAirlineById,
    updateAirline,
    deleteAirline
};