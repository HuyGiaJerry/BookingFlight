const { StatusCodes } = require('http-status-codes');
const { PassengerRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const moment = require('moment');

class PassengerService {
    constructor() {
        this.passengerRepository = new PassengerRepository();
    }

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

    async createPassenger(accountId, passengerData) {
        try {
            this.validatePassengerData(passengerData);

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

        const isValid = errors.length === 0;

        if (!isValid && throwError) {
            throw new AppError(errors.join(', '), StatusCodes.BAD_REQUEST);
        }

        return { isValid, errors };
    }

    calculateAge(dateOfBirth) {
        return moment().diff(moment(dateOfBirth), 'years');
    }

    determinePassengerType(age) {
        if (age < 2) return 'infant';
        if (age < 12) return 'child';
        return 'adult';
    }
}

module.exports = PassengerService;