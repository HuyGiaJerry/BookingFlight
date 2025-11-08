const {FlightScheduleFareRepository} = require('../repositories');
const {StatusCodes} = require('http-status-codes');
const AppError = require('../utils/errors/app-error');

class FlightScheduleFareService {
    constructor() {
        this.flightScheduleFareRepository = new FlightScheduleFareRepository();
    }

    async createFlightScheduleFare(data) {
        try {
            const {flight_schedule_id, class_type, price, seat_allocated} = data;
            if(!flight_schedule_id || !class_type || !price || !seat_allocated) {
                throw new AppError('Invalid flight schedule fare data received', StatusCodes.BAD_REQUEST);
            }
            const flightScheduleFare = await this.flightScheduleFareRepository.create({
                flight_schedule_id,
                class_type,
                price,
                seat_allocated
            });
            return flightScheduleFare;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Cannot create a new flight schedule fare', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getFlightScheduleFares() {
        return await this.flightScheduleFareRepository.getAll();
    }


    async getFlightScheduleFareById(id) {
        try {
            const flightScheduleFare = await this.flightScheduleFareRepository.get(id);
            if (!flightScheduleFare) throw new AppError('Flight schedule fare not found', StatusCodes.NOT_FOUND);
            return flightScheduleFare;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Cannot retrieve flight schedule fare', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }


    async updateFlightScheduleFare(id, data) {
        try {
            const flightScheduleFare = await this.flightScheduleFareRepository.get(id);
            if (!flightScheduleFare) {
                throw new AppError('Flight schedule fare not found', StatusCodes.NOT_FOUND);
            }
            const { flight_schedule_id, class_type, price, seat_allocated } = data;
            if (!flight_schedule_id || !class_type || !price || !seat_allocated) throw new AppError('Invalid flight schedule fare data received', StatusCodes.BAD_REQUEST);
            const updatedFlightScheduleFare = await this.flightScheduleFareRepository.update(id, {
                flight_schedule_id,
                class_type,
                price,
                seat_allocated
            });
            return updatedFlightScheduleFare;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Cannot update flight schedule fare', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteFlightScheduleFare(id) {
        try {
            const flightScheduleFare = await this.flightScheduleFareRepository.get(id);
            if (!flightScheduleFare) throw new AppError('Flight schedule fare not found', StatusCodes.NOT_FOUND);
            await this.flightScheduleFareRepository.destroy(id);
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Cannot delete flight schedule fare', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }


}

module.exports = FlightScheduleFareService;



