const {AirlineRepository} = require('../repositories');
const {StatusCodes} = require('http-status-codes');
const AppError = require('../utils/errors/app-error');

class AirlineService {
    constructor(airlineRepository){
        this.airlineRepository = airlineRepository || new AirlineRepository();
    }

    async createAirline(data){
        try {
            const {name, logo_url, code} = data;
            if(!name || !code) throw new AppError('Name and code are required', StatusCodes.BAD_REQUEST);

            return await this.airlineRepository.create({
                name,
                logo_url,
                code
            })

        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to create airline', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }


    async getAllAirlines(){
        return this.airlineRepository.getAll();
    }

    async getAirlineById(airlineId){
            const airline = await this.airlineRepository.get(airlineId);
            if(!airline) throw new AppError('Airline not found', StatusCodes.NOT_FOUND);
            return airline;
    }

    async updateAirline(airlineId, airlineData){
        try {
            const updated = await this.airlineRepository.update(airlineId, airlineData);
            if(!updated) throw new AppError('Airline not found', StatusCodes.NOT_FOUND);
            
            return updated;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to update airline', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteAirline(airlineId){
        try {
            const deleted = await this.airlineRepository.destroy(airlineId);
            if(!deleted) throw new AppError('Airline not found', StatusCodes.NOT_FOUND);
            return deleted;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to delete airline', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

}

module.exports = AirlineService;