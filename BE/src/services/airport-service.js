const { AirportRepository } = require('../repositories');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');

class AirportService {
    constructor(airportRepository) {
        this.airportRepository = airportRepository || new AirportRepository();
    }

    async createAirport(airportData) {
        try {
            const { name, city, country, iata_code, timezone } = airportData;
            if (!name || !iata_code) {
                throw new AppError('Name and IATA code are required', StatusCodes.BAD_REQUEST);
            }
            return await this.airportRepository.create({
                name,
                iata_code,
                city,
                country,
                timezone
            });
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to create airport', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllAirports() {
        return this.airportRepository.getAll();
    }

    async getAllAirportsPaginated(page = 1, limit = 10) {
        page = parseInt(page);
        limit = parseInt(limit);
        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 10;
        console.log('Service - page:', page, 'limit:', limit);
        return this.airportRepository.getAllPagination(page, limit, {}, [['id', 'ASC']]);
    }

    async getAirportById(airportId) {
        const airport = await this.airportRepository.get(airportId);
        if (!airport) throw new AppError('Airport not found', StatusCodes.NOT_FOUND);
        return airport;
    }

    async getAirportByIata(iataCode) {
        const airport = await this.airportRepository.findOne('iata_code', iataCode);
        if (!airport) throw new AppError(`Airport with IATA code ${iataCode} not found`, StatusCodes.NOT_FOUND);
        return airport;
    }

    async searchAirports(query, page = 1, limit = 10) {
        try {
            if (!query) throw new AppError('Search query is required', StatusCodes.BAD_REQUEST);
            const airports = await this.airportRepository.searchAirports(query, page, limit);
            return airports;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to search airports', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async updateAirport(airportId, airportData) {
        try {
            const updated = await this.airportRepository.update(airportId, airportData);
            if (!updated) throw new AppError('Airport not found', StatusCodes.NOT_FOUND);

            return updated;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to update airport', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteAirport(airportId) {
        const deleted = await this.airportRepository.destroy(airportId);
        if (!deleted) throw new AppError('Airport not found', StatusCodes.NOT_FOUND);
        return deleted;
    }

}

module.exports = AirportService;