const CrudRepository = require('./crud-repository');
const { Airplane } = require('../models');
const {Airline} = require('../models');
class AirplaneRepository extends CrudRepository {
    constructor() {
        super(Airplane);
    }

    async getAllWithDetails() {
        const airplanes = await Airplane.findAll({
            attributes: ['id', 'model', 'seat_capacity'],
            include: [{
                model: Airline,
                as: 'airline',
                attributes: ['id', 'name','code','logo_url']
            }]
        })
        return airplanes;
    }

    async getAirplaneByIdWithDetails(airplaneId) {
        const airplane = await Airplane.findByPk(airplaneId, {
            attributes: ['id', 'model', 'seat_capacity'],
            include: [{
                model: Airline,
                as: 'airline',
                attributes: ['id', 'name','code','logo_url']
            }]
        });
        return airplane;
    }

}


module.exports = AirplaneRepository;