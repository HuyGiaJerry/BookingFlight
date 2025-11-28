const { StatusCodes } = require('http-status-codes');
const { PassengerRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const moment = require('moment');

class PassengerService {
    constructor() {
        this.passengerRepository = new PassengerRepository();
    }

    // ✅ EXISTING: Get user passengers
    async getUserPassengers(accountId) {
        try {
            const passengers = await this.passengerRepository.getUserPassengers(accountId);

            return {
                account_id: accountId,
                passengers: passengers.map(passenger => ({
                    ...passenger.toJSON(),
                    age: this.calculateAge(passenger.date_of_birth)
                })),
                total_saved: passengers.length
            };
        } catch (error) {
            console.error('Error getting user passengers:', error);
            throw error;
        }
    }

    // ✅ NEW: Get passenger by ID
    async getPassengerById(passengerId, accountId) {
        try {
            const passenger = await this.passengerRepository.getPassengerById(passengerId, accountId);

            if (!passenger) {
                throw new AppError('Passenger not found', StatusCodes.NOT_FOUND);
            }

            return {
                ...passenger.toJSON(),
                age: this.calculateAge(passenger.date_of_birth)
            };
        } catch (error) {
            console.error('Error getting passenger by ID:', error);
            throw error;
        }
    }

    // ✅ EXISTING: Create passenger
    async createPassenger(accountId, passengerData) {
        try {
            this.validatePassengerData(passengerData);

            // ✅ NEW: Check for duplicates
            const isDuplicate = await this.passengerRepository.checkDuplicatePassenger(accountId, passengerData);
            if (isDuplicate) {
                throw new AppError('Passenger with same name and date of birth already exists', StatusCodes.CONFLICT);
            }

            const age = this.calculateAge(passengerData.date_of_birth);
            passengerData.passenger_type = this.determinePassengerType(age);

            const passenger = await this.passengerRepository.createPassenger(accountId, passengerData);

            return {
                ...passenger.toJSON(),
                age: age
            };
        } catch (error) {
            console.error('Error creating passenger:', error);
            throw error;
        }
    }

    // ✅ NEW: Update passenger
    async updatePassenger(passengerId, accountId, passengerData) {
        try {
            this.validatePassengerData(passengerData);

            // ✅ Check ownership
            const exists = await this.passengerRepository.validatePassengerOwnership(passengerId, accountId);
            if (!exists) {
                throw new AppError('Passenger not found or access denied', StatusCodes.NOT_FOUND);
            }

            // ✅ Check for duplicates (excluding current passenger)
            const isDuplicate = await this.passengerRepository.checkDuplicatePassenger(
                accountId,
                passengerData,
                passengerId
            );
            if (isDuplicate) {
                throw new AppError('Another passenger with same name and date of birth already exists', StatusCodes.CONFLICT);
            }

            const age = this.calculateAge(passengerData.date_of_birth);
            passengerData.passenger_type = this.determinePassengerType(age);

            const updatedPassenger = await this.passengerRepository.updatePassenger(passengerId, accountId, passengerData);

            if (!updatedPassenger) {
                throw new AppError('Failed to update passenger', StatusCodes.INTERNAL_SERVER_ERROR);
            }

            return {
                ...updatedPassenger.toJSON(),
                age: age
            };
        } catch (error) {
            console.error('Error updating passenger:', error);
            throw error;
        }
    }

    // ✅ NEW: Delete passenger (soft delete)
    async deletePassenger(passengerId, accountId) {
        try {
            const exists = await this.passengerRepository.validatePassengerOwnership(passengerId, accountId);
            if (!exists) {
                throw new AppError('Passenger not found or access denied', StatusCodes.NOT_FOUND);
            }

            const deleted = await this.passengerRepository.deletePassenger(passengerId, accountId);

            if (!deleted) {
                throw new AppError('Failed to delete passenger', StatusCodes.INTERNAL_SERVER_ERROR);
            }

            return { message: 'Passenger deleted successfully' };
        } catch (error) {
            console.error('Error deleting passenger:', error);
            throw error;
        }
    }

    // ✅ NEW: Restore passenger
    async restorePassenger(passengerId, accountId) {
        try {
            const restored = await this.passengerRepository.restorePassenger(passengerId, accountId);

            if (!restored) {
                throw new AppError('Passenger not found or already active', StatusCodes.NOT_FOUND);
            }

            const passenger = await this.passengerRepository.getPassengerById(passengerId, accountId);

            return {
                ...passenger.toJSON(),
                age: this.calculateAge(passenger.date_of_birth)
            };
        } catch (error) {
            console.error('Error restoring passenger:', error);
            throw error;
        }
    }

    // ✅ NEW: Search passengers
    async searchPassengers(accountId, searchTerm) {
        try {
            if (!searchTerm || searchTerm.trim().length < 2) {
                throw new AppError('Search term must be at least 2 characters', StatusCodes.BAD_REQUEST);
            }

            const passengers = await this.passengerRepository.searchPassengersByName(accountId, searchTerm.trim());

            return {
                search_term: searchTerm.trim(),
                passengers: passengers.map(passenger => ({
                    ...passenger.toJSON(),
                    age: this.calculateAge(passenger.date_of_birth)
                })),
                total_found: passengers.length
            };
        } catch (error) {
            console.error('Error searching passengers:', error);
            throw error;
        }
    }

    // ✅ NEW: Get passengers with pagination
    async getPassengersWithPagination(accountId, page = 1, limit = 10) {
        try {
            const result = await this.passengerRepository.getPassengersWithPagination(accountId, page, limit);

            return {
                account_id: accountId,
                passengers: result.passengers.map(passenger => ({
                    ...passenger.toJSON(),
                    age: this.calculateAge(passenger.date_of_birth)
                })),
                pagination: result.pagination
            };
        } catch (error) {
            console.error('Error getting passengers with pagination:', error);
            throw error;
        }
    }

    // ✅ NEW: Get passenger statistics
    async getPassengerStats(accountId) {
        try {
            const stats = await this.passengerRepository.getPassengerStats(accountId);
            return stats;
        } catch (error) {
            console.error('Error getting passenger statistics:', error);
            throw error;
        }
    }

    // ✅ EXISTING: Validate passenger data
    validatePassengerData(passengerData, throwError = true) {
        const errors = [];

        if (!passengerData.fullname || passengerData.fullname.trim().length < 2) {
            errors.push('Full name must be at least 2 characters');
        }

        if (!passengerData.date_of_birth) {
            errors.push('Date of birth is required');
        } else {
            const age = this.calculateAge(passengerData.date_of_birth);
            if (age < 0 || age > 120) {
                errors.push('Invalid date of birth');
            }
        }

        // ✅ NEW: Additional validations
        if (passengerData.gender && !['male', 'female', 'other'].includes(passengerData.gender)) {
            errors.push('Gender must be male, female, or other');
        }

        if (passengerData.passport_number && passengerData.passport_number.length < 6) {
            errors.push('Passport number must be at least 6 characters');
        }

        if (passengerData.id_card_number && passengerData.id_card_number.length < 8) {
            errors.push('ID card number must be at least 8 characters');
        }

        const isValid = errors.length === 0;

        if (!isValid && throwError) {
            throw new AppError(errors.join(', '), StatusCodes.BAD_REQUEST);
        }

        return { isValid, errors };
    }

    // ✅ EXISTING: Calculate age
    calculateAge(dateOfBirth) {
        return moment().diff(moment(dateOfBirth), 'years');
    }

    // ✅ EXISTING: Determine passenger type
    determinePassengerType(age) {
        if (age < 2) return 'infant';
        if (age < 12) return 'child';
        return 'adult';
    }
}

module.exports = PassengerService;