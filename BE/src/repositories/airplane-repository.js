const CrudRepository = require('./crud-repository');
const { Airplane } = require('../models');
const { Airline } = require('../models');
class AirplaneRepository extends CrudRepository {
    constructor() {
        super(Airplane);
    }

    async getAllWithDetailsPagination(page = 1, limit = 10, filters = {}, order = [['id', 'ASC']]) {
        
            const offset = (page - 1) * limit;
            
            const result = await Airplane.findAndCountAll({
                where: filters,
                limit: limit,
                offset: offset,
                order: order,
                attributes: ['id', 'registration_number', 'model', 'total_seats'],
                include: [{
                    model: Airline,
                    as: 'airline',
                    attributes: ['id', 'name', 'iata_code', 'logo_url']
                }]
            });

            const totalPages = Math.ceil(result.count / limit);
            
            return {
                items: result.rows,
                pagination: {
                    currentPage: page,
                    limit: limit,
                    totalPages: totalPages,
                    totalCount: result.count,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            };
        
    }

    async getAirplaneByIdWithDetails(airplaneId) {
        const airplane = await Airplane.findByPk(airplaneId, {
            attributes: ['id', 'registration_number', 'model', 'total_seats'],
            include: [{
                model: Airline,
                as: 'airline',
                attributes: ['id', 'name', 'iata_code', 'logo_url']
            }]
        });
        return airplane;
    }

    async getAirplanesByAirlineIdWithDetails(airlineId) {
        try {
            const airplanes = await Airplane.findAll({
                where: { airline_id: airlineId },
                attributes: ['id', 'registration_number', 'model', 'total_seats'],
                include: [{
                    model: Airline,
                    as: 'airline',
                    attributes: ['id', 'name', 'iata_code', 'logo_url']
                }],
                order: [['id', 'ASC']]
            });
            return airplanes;
        } catch (error) {
            console.error('Error in getAirplanesByAirlineIdWithDetails:', error);
            throw error;
        }
    }

}


module.exports = AirplaneRepository;