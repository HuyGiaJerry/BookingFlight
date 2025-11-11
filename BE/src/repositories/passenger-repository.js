const CrudRepository = require('./crud-repository');
const { Passenger } = require('../models');

class PassengerRepository extends CrudRepository {
    constructor() {
        super(Passenger);
    }

    async createPassengers(passengersData) {
        try {
            const passengers = await Promise.all(passengersData.map(passengerData => this.create(passengerData)));
            return passengers;
        } catch (error) {
            throw error;
        }
    }

    async getPassengerByIds(passengerIds) {
        try {
            const passengers = await Passenger.findAll({
                where: {
                    id: passengerIds
                }
            });
            return passengers;
        } catch (error) {
            throw error;
        }
    }


}

module.exports = PassengerRepository;