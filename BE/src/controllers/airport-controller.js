const { StatusCodes } = require('http-status-codes');
const { AirportService } = require('../services');
const {Responses} = require('../utils/common');

const airportService = new AirportService();

async function createAirport(req, res, next) {
    try {
        const newAirport = await airportService.createAirport(req.body);
        
        return res
            .status(StatusCodes.CREATED)
            .json(Responses.SuccessResponse(newAirport, "Airport created successfully"));
    } catch (error) {
        next(error);
    }
}


async function getAllAirports(req, res, next) {
    try {
        console.log('query params', req.query);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const airports = await airportService.getAllAirportsPaginated(
            page, limit
        );
        return res
            .status(StatusCodes.OK)
            .json(Responses.PaginationResponse(airports.items, airports.pagination, "Airports fetched successfully"));
    } catch (error) {
        next(error);
    }
}

async function getAirportById(req, res, next) {
    try {
        const airport = await airportService.getAirportById(req.params.id);
        return res
            .status(StatusCodes.OK)
            .json(Responses.SuccessResponse(airport, "Airport fetched successfully"));
    } catch (error) {
        next(error);
    }
}

async function searchAirports(req, res, next) {
    try {
        const keyword = req.query.keyword || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const data = await airportService.searchAirports(keyword, page, limit);
        return res
            .status(StatusCodes.OK).json(Responses.PaginationResponse(data.items, data.pagination, "Airports fetched successfully"));
    } catch (error) {
        next(error);
    }
}

async function updateAirport(req, res, next) {
    try {
        const updatedAirport = await airportService.updateAirport(req.params.id, req.body);
        return res
            .status(StatusCodes.OK)
            .json(updatedAirport);
    } catch (error) {
        next(error);
    }
}

async function deleteAirport(req, res, next) {
    try {
        await airportService.deleteAirport(req.params.id);
        return res
            .status(StatusCodes.NO_CONTENT)
            .send();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createAirport,
    getAllAirports,
    getAirportById,
    updateAirport,
    deleteAirport,
    searchAirports
};

