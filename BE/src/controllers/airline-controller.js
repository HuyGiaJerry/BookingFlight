const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const { AirlineService } = require('../services');

const airlineService = new AirlineService();

async function createAirline(req, res, next) {
    try {
        const newAirline = await airlineService.createAirline(req.body);
        return res
            .status(StatusCodes.CREATED)
            .json(newAirline);
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
            .json(airlines);
    } catch (error) {
        next(error);
    }
}


async function getAirlineById(req, res, next) {
    try {
        const airline = await airlineService.getAirlineById(req.params.id);
        return res
            .status(StatusCodes.OK)
            .json(airline);
    } catch (error) {
        next(error);
    }
}

async function updateAirline(req, res,next) {
    try {
        const updatedAirline = await airlineService.updateAirline(req.params.id, req.body);
        return res
            .status(StatusCodes.OK)
            .json(updatedAirline);
    } catch (error) {
        next(error);
    }
}

async function deleteAirline(req, res, next) {
    try {
        await airlineService.deleteAirline(req.params.id);
        return res
            .status(StatusCodes.NO_CONTENT)
            .send();
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