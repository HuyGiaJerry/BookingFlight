const {StatusCodes} = require('http-status-codes');
const {FlightService} = require('../services');
const {createSuccessResponse} = require('../utils/common/create-responses');

const flightService = new FlightService();

async function createFlight(req, res, next) {
    try {
        const flight = await flightService.createFlight(req.body);
        const response = createSuccessResponse(flight, 'Flight created successfully');
        return res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        next(error);
    }
} 


async function getAllFlights(req, res, next) {
    try {
        const flights = await flightService.getAllFlights();
        const response = createSuccessResponse(flights, 'Flights retrieved successfully');
        return res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
}


async function getFlightById(req, res, next) {
    try {
        const flight = await flightService.getFlightById(req.params.id);
        const response = createSuccessResponse(flight, 'Get Flight by Id retrieved successfully');
        return res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
}


async function updateFlight(req, res, next) {
    try {
        const flight = await flightService.updateFlight(req.params.id, req.body);
        const response = createSuccessResponse(flight, 'Flight updated successfully');
        return res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
}

async function deleteFlight(req, res, next) {
    try {
        const flight = await flightService.deleteFlight(req.params.id);
        const response = createSuccessResponse(flight, 'Flight deleted successfully');
        return res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
}

async function searchFlights(req, res, next) {
    try {
        const searchCriteria = req.query; // Lấy parameters từ query string
        const flights = await flightService.searchFlights(searchCriteria);
        const response = createSuccessResponse(flights, 'Flights search completed successfully');
        return res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createFlight,
    getAllFlights,
    getFlightById,
    updateFlight,
    deleteFlight,
    searchFlights
};