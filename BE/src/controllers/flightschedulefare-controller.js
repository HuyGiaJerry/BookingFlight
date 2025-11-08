const {StatusCodes} = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const {FlightScheduleFareService} = require('../services');

const flightScheduleFareService = new FlightScheduleFareService();

async function createFlightScheduleFare(req, res,next) {

    try {
        const flightScheduleFare = await flightScheduleFareService.createFlightScheduleFare(req.body);
        res.status(StatusCodes.CREATED).
        json({
            data: flightScheduleFare,
            success: true,
            message: 'Successfully created a flight schedule fare',
            err: {}
        });
    } catch (error) {
        next(error);
    }
}


async function getFlightScheduleFare(req, res, next) {
    try {
        const flightScheduleFare = await flightScheduleFareService.getFlightScheduleFareById(req.params.id);
        res.status(StatusCodes.OK).
        json({
            data: flightScheduleFare,
            success: true,
            message: 'Successfully fetched flight schedule fare',
            err: {}
        });
    } catch (error) {
        next(error);
    }
}

async function getFlightScheduleFares(req, res,next) {
    try {
        const flightScheduleFares = await flightScheduleFareService.getFlightScheduleFares();
        res.status(StatusCodes.OK).
        json({
            data: flightScheduleFares,
            success: true,
            message: 'Successfully fetched all flight schedule fares',
            err: {}
        });
    } catch (error) {
        next(error);
    }
}

async function updateFlightScheduleFare(req, res,next) {
    try {
        const flightScheduleFare = await flightScheduleFareService.updateFlightScheduleFare(req.params.id, req.body);
        res.status(StatusCodes.OK).
        json({
            data: flightScheduleFare,
            success: true,
            message: 'Successfully updated flight schedule fare',
            err: {}
        });
    } catch (error) {
        next(error);
    }
}


async function deleteFlightScheduleFare(req, res,next) {
    try {
        await flightScheduleFareService.deleteFlightScheduleFare(req.params.id);
        res.status(StatusCodes.OK).
        json({
            data: null,
            success: true,
            message: 'Successfully deleted flight schedule fare',
            err: {}
        });
    } catch (error) {
        next(error);
    }
}


async function deleteFlightScheduleFare(req, res,next) {
    try {
        await flightScheduleFareService.deleteFlightScheduleFare(req.params.id);
        res.status(StatusCodes.OK).
        json({
            data: null,
            success: true,
            message: 'Successfully deleted flight schedule fare',
            err: {}
        });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    createFlightScheduleFare,
    getFlightScheduleFare,
    getFlightScheduleFares,
    updateFlightScheduleFare,
    deleteFlightScheduleFare
};