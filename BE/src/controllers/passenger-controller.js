const { StatusCodes } = require('http-status-codes');
const { PassengerService } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

class PassengerController {
    constructor() {
        this.passengerService = new PassengerService();
    }

    /**
     * 🔸 GET /api/v1/passengers/user/:accountId
     * Get saved passengers for user
     */
    getUserPassengers = async (req, res) => {
        try {
            const { accountId } = req.params;

            const passengers = await this.passengerService.getUserPassengers(parseInt(accountId));

            SuccessResponse.message = 'User passengers retrieved successfully';
            SuccessResponse.data = passengers;
            return res.status(StatusCodes.OK).json(SuccessResponse);

        } catch (error) {
            console.error('Error in getUserPassengers:', error);
            ErrorResponse.error = error;
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
        }
    };

    /**
     * 🔸 POST /api/v1/passengers/create
     * Create/save new passenger
     */
    createPassenger = async (req, res) => {
        try {
            const { account_id, ...passengerData } = req.body;

            if (!account_id) {
                ErrorResponse.message = 'account_id is required';
                return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
            }

            const passenger = await this.passengerService.createPassenger(account_id, passengerData);

            SuccessResponse.message = 'Passenger created successfully';
            SuccessResponse.data = passenger;
            return res.status(StatusCodes.CREATED).json(SuccessResponse);

        } catch (error) {
            console.error('Error in createPassenger:', error);
            ErrorResponse.error = error;
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
        }
    };

    /**
     * 🔸 POST /api/v1/passengers/validate
     * Validate passenger data
     */
    validatePassengerData = async (req, res) => {
        try {
            const passengerData = req.body;

            const validation = this.passengerService.validatePassengerData(passengerData, false);

            SuccessResponse.message = validation.isValid ? 'Passenger data is valid' : 'Passenger data validation failed';
            SuccessResponse.data = validation;
            return res.status(StatusCodes.OK).json(SuccessResponse);

        } catch (error) {
            console.error('Error in validatePassengerData:', error);
            ErrorResponse.error = error;
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
        }
    };
}

module.exports = PassengerController;