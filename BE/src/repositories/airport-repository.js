const CrudRepository = require('./crud-repository');
const {Airport} = require('../models');
const AppError = require('../utils/errors/app-error');
const {StatusCodes} = require('http-status-codes');
const { where } = require('sequelize');
const { Op } = require('sequelize');

class AirportRepository extends CrudRepository {
    constructor(){
        super(Airport);
    }

    async searchAirports(keyword) {
        try {
            const airports = await Airport.findAll({
                where: {
                    [Op.or]:[
                        { city: { [Op.like]: `%${keyword.toLowerCase()}%` } },
                        { name: { [Op.like]: `%${keyword.toLowerCase()}%` } },
                        { iata_code: { [Op.like]: `%${keyword.toUpperCase()}%` } },
                        { country: { [Op.like]: `%${keyword.toLowerCase()}%` } },
                    ]
                }
            })
            return airports;
        } catch (error) {
            throw new AppError('Unable to search airports', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }



}

module.exports = AirportRepository;