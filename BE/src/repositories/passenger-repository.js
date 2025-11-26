const CrudRepository = require('./crud-repository');
const {Passenger, Account} = require('../models');
const { Op, where } = require('sequelize');

class PassengerRepository extends CrudRepository {
    constructor() {
        super(Passenger);
    }

    // Get user saved passengers
    async getUserPassengers(account_id) {
        try {
            return await Passenger.findAll({
                where: { account_id: account_id
                },
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            console.log("Something went wrong in the Passenger Repository: getUserPassengers", error);
            throw error;
        }
    }

    // Create passenger for user
    async createPassenger(accountId, passengerData) {
        try {
            return await Passenger.create({
                account_id: accountId,
                ...passengerData
            })
        } catch (error) {
            console.log("Something went wrong in the Passenger Repository: createPassenger", error);
            throw error;
        }
    }

    // Update passenger 
    async updatePassenger(passengerId, accountId, passengerData) {
        try {
            const [updateRows] = await Passenger.update( passengerData, {
                where: {
                    id: passengerId,
                    account_id: accountId
                }
            });
            if (updateRows === 0)  return null;
            return await Passenger.findByPk(passengerId);
        } catch (error) {
            console.log("Something went wrong in the Passenger Repository: updatePassenger", error);
            throw error;
        }
    }

    // Delete passenger
    async deletePassenger(passengerId, accountId) {
        try {
            const [updateRows] = await Passenger.update(
                {
                    where: {
                        id: passengerId,
                        account_id: accountId,
                    }
                }
            )

            return updateRows > 0;
        } catch (error) {
            console.log("Something went wrong in the Passenger Repository: deletePassenger", error);
            throw error;
        }
    }

    // Check if passenger belongs to account
    async validatePassengerOwnership(passengerId, accountId) {
        try {
            const passenger = await Passenger.findOne({
                where: {
                    id: passengerId,
                    account_id: accountId
                }
            });

            return !!passenger;
        } catch (error) {
            console.error('Error validating passenger ownership:', error);
            throw error;
        }
    }

    // Get passengers by IDs for specific account
    async getPassengersByIds(passengerIds, accountId) {
        try {
            return await Passenger.findAll({
                where: {
                    id: { [Op.in]: passengerIds },
                    account_id: accountId,
                    is_deleted: false
                }
            });
        } catch (error) {
            console.error('Error getting passengers by IDs:', error);
            throw error;
        }
    }


}

module.exports = PassengerRepository;