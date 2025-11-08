const {StatusCodes} = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const {AirplaneService} = require('../services');
const airplaneService = new AirplaneService();


async function createAirplane(req, res, next) {
    try {
        const airplane = await airplaneService.createAirplane(req.body);
        res.status(StatusCodes.CREATED).json({
            success: true,
            data: airplane,
            message: 'Airplane created successfully'
        });
    } catch (error) {
        next(error);
    }
}

async function getAllAirplanes(req, res, next) {
    try {
        const airplanes = await airplaneService.getAllAirplanes();
        res.status(StatusCodes.OK).json({
            success: true,
            data: airplanes,
            message: 'Airplanes fetched successfully'
        });
    } catch (error) {
        next(error);
    }
}


async function getAirplaneByAirplaneId(req, res, next) {
    try {
        const airplane = await airplaneService.getAirplaneByAirplaneId(req.params.id);
        res.status(StatusCodes.OK).json({
            success: true,
            data: airplane,
            message: 'Airplane fetched by ID successfully'
        });
    } catch (error) {
        next(error);
    }
}

async function getAirplanesByAirlineId(req, res, next) {
    try {
        const airplanes = await airplaneService.getAirplanesByAirlineId(req.params.id);
        res.status(StatusCodes.OK).json({
            success: true,
            data: airplanes,
            message: 'Airplanes fetched by airline ID successfully'
        });
    } catch (error) {
        next(error);
    }
}

async function updateAirplane(req, res, next) {
    try {
        const airplane = await airplaneService.updateAirplane(req.params.id, req.body);
        res.status(StatusCodes.OK).json({
            success: true,
            data: airplane,
            message: 'Airplane updated successfully'
        });
    } catch (error) {
        next(error);
    }   
}

async function deleteAirplane(req, res, next) {
    try {
        const response = await airplaneService.deleteAirplane(req.params.id);
        res.status(StatusCodes.OK).json({
            success: true,
            data: response,
            message: 'Airplane deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createAirplane,
    getAllAirplanes,
    getAirplaneByAirplaneId,
    getAirplanesByAirlineId,
    updateAirplane,
    deleteAirplane
};
