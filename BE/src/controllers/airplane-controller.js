const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const { AirplaneService } = require('../services');
const { Responses } = require('../utils/common');


const airplaneService = new AirplaneService();
async function createAirplane(req, res, next) {
    try {
        const airplane = await airplaneService.createAirplane(req.body);
        res.status(StatusCodes.CREATED).json(Responses.SuccessResponse(airplane, 'Airplane created successfully'));
    } catch (error) {
        next(error);
    }
}

async function getAllAirplanes(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const data = await airplaneService.getAllAirplanes(page, limit);
        res.status(StatusCodes.OK).json(Responses.PaginationResponse(data.items,data.pagination, 'Airplanes fetched successfully'));
    } catch (error) {
        next(error);
    }
}


async function getAirplaneById(req, res, next) {
    try {
        const airplane = await airplaneService.getAirplaneById(req.params.id);
        res.status(StatusCodes.OK).json(Responses.SuccessResponse(airplane, 'Airplane fetched by ID successfully'));
    } catch (error) {
        next(error);
    }
}


async function getAirplanesByAirlineId(req, res, next) {
    try {
        const airplanes = await airplaneService.getAirplanesByAirlineId(req.params.id);
        res.status(StatusCodes.OK).json(Responses.SuccessResponse(airplanes, 'Airplanes fetched by airline ID successfully'));
    } catch (error) {
        next(error);
    }
}

async function updateAirplane(req, res, next) {
    try {
        const airplane = await airplaneService.updateAirplane(req.params.id, req.body);
        res.status(StatusCodes.OK).json(Responses.SuccessResponse(airplane, 'Airplane updated successfully'));
    } catch (error) {
        next(error);
    }
}

async function deleteAirplane(req, res, next) {
    try {
        const response = await airplaneService.deleteAirplane(req.params.id);
        res.status(StatusCodes.OK).json(Responses.SuccessResponse(response, 'Airplane deleted successfully'));
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createAirplane,
    getAllAirplanes,
    getAirplaneById,
    getAirplanesByAirlineId,
    updateAirplane,
    deleteAirplane
};
