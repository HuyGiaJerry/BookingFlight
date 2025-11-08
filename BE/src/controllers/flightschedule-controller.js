const { StatusCodes } = require('http-status-codes');
const {FlightScheduleService} = require('../services');

const flightScheduleService = new FlightScheduleService();

async function createFlightSchedule(req, res, next) {
    try {
        const flightScheduleData = req.body;
        const flightSchedule = await flightScheduleService.createFlightSchedule(flightScheduleData);
        return res.status(StatusCodes.CREATED).json({
            success: true,
            data: flightSchedule,
            message: 'Flight schedule created successfully'
        });
    } catch (error) {
        next(error);
    }
}


async function getFlightScheduleById(req, res, next) {
    try {
        const flightSchedule = await flightScheduleService.getFlightScheduleById(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            data: flightSchedule,
            message: 'Flight schedule retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
}


async function getAllFlightSchedules(req, res, next) {
    try {
        const flightSchedules = await flightScheduleService.getAllFlightSchedules();
        return res.status(StatusCodes.OK).json({
            success: true,
            data: flightSchedules,
            message: 'Flight schedules retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
}


async function updateFlightSchedule(req, res, next) {
    try {
        const updatedFlightSchedule = await flightScheduleService.updateFlightSchedule(req.params.id, req.body);
        return res.status(StatusCodes.OK).json({
            success: true,
            data: updatedFlightSchedule,
            message: 'Flight schedule updated successfully'
        });
    } catch (error) {
        next(error);
    }
}


async function deleteFlightSchedule(req, res, next) {
    try {
        const deletedFlightSchedule = await flightScheduleService.deleteFlightSchedule(req.params.id);
        return res.status(StatusCodes.OK).json({
            success: true,
            data: deletedFlightSchedule,
            message: 'Flight schedule deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}


module.exports = {
    createFlightSchedule,
    getFlightScheduleById,
    getAllFlightSchedules,
    updateFlightSchedule,
    deleteFlightSchedule
};