const {StatusCodes} = require('http-status-codes');
const {AirportService} = require('../services');

const airportService = new AirportService();

async function createAirport(req, res, next) {
    try {
        const newAirport = await airportService.createAirport(req.body);
        return res
            .status(StatusCodes.CREATED)
            .json(newAirport);
    } catch (error) {
        next(error);
    }
}


async function getAllAirports(req, res, next) {
    try {
        const airports = await airportService.getAllAirports();
        return res
            .status(StatusCodes.OK)
            .json(airports);
    } catch (error) {
        next(error);
    }
}

async function getAirportById(req, res ,next) {
    try {
        const airport = await airportService.getAirportById(req.params.id);
        return res
            .status(StatusCodes.OK)
            .json(airport);
    } catch (error) {
        next(error);
    }
}

async function searchAirports(req, res, next) {
    try {
        const keyword = req.query.keyword || '';
        const data = await airportService.searchAirports(keyword);
        return res 
        .status(StatusCodes.OK).json({
            success: true,
            data: data,
            message: 'Airports fetched successfully'
        })
    } catch (error) {
        next(error);
    }
}

async function updateAirport(req, res,next) {
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

