const { AirplaneRepository } = require('../repositories');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');


class AirplaneService {
    constructor(airplaneRepository) {
        this.airplaneRepository = airplaneRepository || new AirplaneRepository();
    }
    async createAirplane(data) {
        try {
            const { airline_id, registration_number, model, total_seats } = data;
            if (!airline_id || !registration_number || !model || !total_seats) throw new AppError('Airline ID, registration number, model and total seats are required', StatusCodes.BAD_REQUEST);

            const airplane = await this.airplaneRepository.create({
                airline_id,
                registration_number,
                model,
                total_seats
            });
            return airplane;

        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to create airplane', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllAirplanes(page = 1, limit = 10, filters = {}, order = [['id', 'ASC']]) {
        try {
            return this.airplaneRepository.getAllWithDetailsPagination(page, limit, filters, order);
        } catch (error) {
            console.error("Error in getAllAirplanes:", error);
            throw new AppError('Unable to fetch airplanes', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getAirplaneById(airplaneId) {
        const airplane = await this.airplaneRepository.getAirplaneByIdWithDetails(airplaneId);
        if (!airplane) throw new AppError('Airplane not found', StatusCodes.NOT_FOUND);
        return airplane;
    }

    async getAirplanesByAirlineId(airlineId) {
        try {
            if(!airlineId) throw new AppError('Airline ID is required', StatusCodes.BAD_REQUEST);
            const airplanes = await this.airplaneRepository.getAirplanesByAirlineIdWithDetails(airlineId);

            if(!airplanes || airplanes.length === 0) throw new AppError(`No airplanes found for airline ID = ${airlineId}`, StatusCodes.NOT_FOUND);
            
            return airplanes;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to fetch airplanes by airline ID', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async updateAirplane(airplaneId, airplaneData) {
        try {
            const updated = await this.airplaneRepository.update(airplaneId, airplaneData);
            if (!updated) throw new AppError('Airplane not found', StatusCodes.NOT_FOUND);
            return updated;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to update airplane', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteAirplane(airplaneId) {
        try {
            const deleted = await this.airplaneRepository.destroy(airplaneId);
            if (!deleted) throw new AppError('Airplane not found', StatusCodes.NOT_FOUND);
            return deleted;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to delete airplane', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }



}

module.exports = AirplaneService;