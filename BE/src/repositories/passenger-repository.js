const CrudRepository = require('./crud-repository');
const { Passenger, Account } = require('../models');
const { Op, where } = require('sequelize');

class PassengerRepository extends CrudRepository {
    constructor() {
        super(Passenger);
    }

    // Get user saved passengers
    async getUserPassengers(account_id) {
        try {
            return await Passenger.findAll({
                where: {
                    account_id: account_id,
                    is_deleted: false // ✅ THÊM: Chỉ lấy passengers chưa bị xóa
                },
                order: [['createdAt', 'DESC']]
            });
        } catch (error) {
            console.log("Something went wrong in the Passenger Repository: getUserPassengers", error);
            throw error;
        }
    }

    // ✅ NEW: Get passenger by ID with ownership check
    async getPassengerById(passengerId, accountId) {
        try {
            return await Passenger.findOne({
                where: {
                    id: passengerId,
                    account_id: accountId,
                    is_deleted: false
                }
            });
        } catch (error) {
            console.log("Something went wrong in the Passenger Repository: getPassengerById", error);
            throw error;
        }
    }

    // Create passenger for user
    async createPassenger(accountId, passengerData) {
        try {
            return await Passenger.create({
                account_id: accountId,
                ...passengerData
            });
        } catch (error) {
            console.log("Something went wrong in the Passenger Repository: createPassenger", error);
            throw error;
        }
    }

    // ✅ FIXED: Update passenger 
    async updatePassenger(passengerId, accountId, passengerData) {
        try {
            const [updateRows] = await Passenger.update(passengerData, {
                where: {
                    id: passengerId,
                    account_id: accountId,
                    is_deleted: false
                }
            });

            if (updateRows === 0) return null;

            return await Passenger.findByPk(passengerId);
        } catch (error) {
            console.log("Something went wrong in the Passenger Repository: updatePassenger", error);
            throw error;
        }
    }

    // ✅ FIXED: Soft delete passenger
    async deletePassenger(passengerId, accountId) {
        try {
            const [updateRows] = await Passenger.update(
                { is_deleted: true }, // ✅ FIXED: Soft delete
                {
                    where: {
                        id: passengerId,
                        account_id: accountId,
                        is_deleted: false
                    }
                }
            );

            return updateRows > 0;
        } catch (error) {
            console.log("Something went wrong in the Passenger Repository: deletePassenger", error);
            throw error;
        }
    }

    // ✅ NEW: Hard delete passenger (admin only)
    async hardDeletePassenger(passengerId, accountId) {
        try {
            const deleteRows = await Passenger.destroy({
                where: {
                    id: passengerId,
                    account_id: accountId
                }
            });

            return deleteRows > 0;
        } catch (error) {
            console.log("Something went wrong in the Passenger Repository: hardDeletePassenger", error);
            throw error;
        }
    }

    // ✅ NEW: Restore deleted passenger
    async restorePassenger(passengerId, accountId) {
        try {
            const [updateRows] = await Passenger.update(
                { is_deleted: false },
                {
                    where: {
                        id: passengerId,
                        account_id: accountId,
                        is_deleted: true
                    }
                }
            );

            return updateRows > 0;
        } catch (error) {
            console.log("Something went wrong in the Passenger Repository: restorePassenger", error);
            throw error;
        }
    }

    // Check if passenger belongs to account
    async validatePassengerOwnership(passengerId, accountId) {
        try {
            const passenger = await Passenger.findOne({
                where: {
                    id: passengerId,
                    account_id: accountId,
                    is_deleted: false
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

    // ✅ NEW: Search passengers by name
    async searchPassengersByName(accountId, searchTerm) {
        try {
            return await Passenger.findAll({
                where: {
                    account_id: accountId,
                    fullname: {
                        [Op.like]: `%${searchTerm}%`
                    },
                    is_deleted: false
                },
                order: [['fullname', 'ASC']]
            });
        } catch (error) {
            console.error('Error searching passengers by name:', error);
            throw error;
        }
    }

    // ✅ NEW: Get passengers with pagination
    async getPassengersWithPagination(accountId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;

            const { count, rows } = await Passenger.findAndCountAll({
                where: {
                    account_id: accountId,
                    is_deleted: false
                },
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['createdAt', 'DESC']]
            });

            return {
                passengers: rows,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_items: count,
                    items_per_page: parseInt(limit),
                    has_next: page < Math.ceil(count / limit),
                    has_prev: page > 1
                }
            };
        } catch (error) {
            console.error('Error getting passengers with pagination:', error);
            throw error;
        }
    }

    // ✅ NEW: Check duplicate passenger
    async checkDuplicatePassenger(accountId, passengerData, excludeId = null) {
        try {
            const whereCondition = {
                account_id: accountId,
                fullname: passengerData.fullname,
                date_of_birth: passengerData.date_of_birth,
                is_deleted: false
            };

            if (excludeId) {
                whereCondition.id = { [Op.ne]: excludeId };
            }

            const existingPassenger = await Passenger.findOne({
                where: whereCondition
            });

            return !!existingPassenger;
        } catch (error) {
            console.error('Error checking duplicate passenger:', error);
            throw error;
        }
    }

    // ✅ NEW: Get passenger statistics
    async getPassengerStats(accountId) {
        try {
            const totalPassengers = await Passenger.count({
                where: {
                    account_id: accountId,
                    is_deleted: false
                }
            });

            const passengerTypes = await Passenger.findAll({
                attributes: [
                    'passenger_type',
                    [require('sequelize').fn('COUNT', require('sequelize').col('passenger_type')), 'count']
                ],
                where: {
                    account_id: accountId,
                    is_deleted: false
                },
                group: ['passenger_type']
            });

            return {
                total_passengers: totalPassengers,
                by_type: passengerTypes.reduce((acc, item) => {
                    acc[item.passenger_type] = parseInt(item.dataValues.count);
                    return acc;
                }, {})
            };
        } catch (error) {
            console.error('Error getting passenger statistics:', error);
            throw error;
        }
    }
}

module.exports = PassengerRepository;