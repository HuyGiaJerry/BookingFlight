const {StatusCodes} = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const { FlightScheduleRepository } = require('../repositories');
const moment = require('moment');

class FlightScheduleService {
    constructor() {
        this.flightScheduleRepository = new FlightScheduleRepository();
    }

    async createFlightSchedule(data) {
        try {
            const {flight_id, departure_time, arrival_time, available_seat, price} = data;
            if (!flight_id || !departure_time || !arrival_time) throw new AppError('Missing required flight schedule fields', StatusCodes.BAD_REQUEST);

            const departureMoment = moment(departure_time,moment.ISO_8601, true);
            const arrivalMoment = moment(arrival_time,moment.ISO_8601, true);

            if (!departureMoment.isValid() || !arrivalMoment.isValid()) throw new AppError('Invalid date format', StatusCodes.BAD_REQUEST);

            const flightSchedule = await this.flightScheduleRepository.create({
                flight_id,
                departure_time: departureMoment.toDate(),
                arrival_time: arrivalMoment.toDate(),
                available_seat,
                price,
                flight_schedule_status: 'scheduled' // default status
            });
            return flightSchedule;
            
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to create flight schedule', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async  getFlightScheduleById(id) {
        try {
            const flightSchedule = await this.flightScheduleRepository.get(id);
            if (!flightSchedule) throw new AppError('Flight schedule not found', StatusCodes.NOT_FOUND);
            return flightSchedule;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to retrieve flight schedule', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllFlightSchedules(page = 1, limit = 10) {
        try {
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;
            return await this.flightScheduleRepository.getAllFlightSchedules(pageNum, limitNum);
        } catch (error) {
            throw new AppError('Unable to retrieve flight schedules', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }


    async updateFlightSchedule(id, data) {
        try {
            const updated = await this.flightScheduleRepository.update(id, data);
            if (!updated) throw new AppError('Flight schedule not found', StatusCodes.NOT_FOUND);
            return updated;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to update flight schedule', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteFlightSchedule(id) {
        try {
            const deleted = await this.flightScheduleRepository.destroy(id);
            if (!deleted) throw new AppError('Flight schedule not found', StatusCodes.NOT_FOUND);
            return deleted;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to delete flight schedule', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }



}

module.exports = FlightScheduleService;