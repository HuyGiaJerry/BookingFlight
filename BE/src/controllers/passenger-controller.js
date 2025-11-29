const { StatusCodes } = require('http-status-codes');
const { PassengerService } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

class PassengerController {
    constructor() {
        this.passengerService = new PassengerService();
    }

    /**
     * ✅ EXISTING: GET /api/v1/passengers/user/:accountId
     * Get saved passengers for user
     */
    getUserPassengers = async (req, res) => {
        try {
            const { accountId } = req.params;
            const { page, limit } = req.query;

            let passengers;

            if (page && limit) {
                // ✅ NEW: Pagination support
                passengers = await this.passengerService.getPassengersWithPagination(
                    parseInt(accountId),
                    parseInt(page),
                    parseInt(limit)
                );
            } else {
                // ✅ EXISTING: Get all passengers
                passengers = await this.passengerService.getUserPassengers(parseInt(accountId));
            }

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
     * ✅ NEW: GET /api/v1/passengers/:passengerId
     * Get passenger by ID
     */
    getPassengerById = async (req, res) => {
        try {
            const { passengerId } = req.params;
            const { accountId } = req.query; // From auth middleware or query

            if (!accountId) {
                ErrorResponse.message = 'account_id is required';
                return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
            }

            const passenger = await this.passengerService.getPassengerById(
                parseInt(passengerId),
                parseInt(accountId)
            );

            SuccessResponse.message = 'Passenger retrieved successfully';
            SuccessResponse.data = passenger;
            return res.status(StatusCodes.OK).json(SuccessResponse);

        } catch (error) {
            console.error('Error in getPassengerById:', error);
            ErrorResponse.error = error;
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
        }
    };

    /**
     * ✅ EXISTING: POST /api/v1/passengers/create
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
     * ✅ NEW: PUT /api/v1/passengers/:passengerId
     * Update passenger
     */
    updatePassenger = async (req, res) => {
        try {
            const { passengerId } = req.params;
            const { account_id, ...passengerData } = req.body;

            if (!account_id) {
                ErrorResponse.message = 'account_id is required';
                return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
            }

            const passenger = await this.passengerService.updatePassenger(
                parseInt(passengerId),
                parseInt(account_id),
                passengerData
            );

            SuccessResponse.message = 'Passenger updated successfully';
            SuccessResponse.data = passenger;
            return res.status(StatusCodes.OK).json(SuccessResponse);

        } catch (error) {
            console.error('Error in updatePassenger:', error);
            ErrorResponse.error = error;
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
        }
    };

    /**
     * ✅ NEW: DELETE /api/v1/passengers/:passengerId
     * Soft delete passenger
     */
    deletePassenger = async (req, res) => {
        try {
            const { passengerId } = req.params;
            const { account_id } = req.body;

            if (!account_id) {
                ErrorResponse.message = 'account_id is required';
                return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
            }

            const result = await this.passengerService.deletePassenger(
                parseInt(passengerId),
                parseInt(account_id)
            );

            SuccessResponse.message = 'Passenger deleted successfully';
            SuccessResponse.data = result;
            return res.status(StatusCodes.OK).json(SuccessResponse);

        } catch (error) {
            console.error('Error in deletePassenger:', error);
            ErrorResponse.error = error;
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
        }
    };

    /**
     * ✅ NEW: PATCH /api/v1/passengers/:passengerId/restore
     * Restore deleted passenger
     */
    restorePassenger = async (req, res) => {
        try {
            const { passengerId } = req.params;
            const { account_id } = req.body;

            if (!account_id) {
                ErrorResponse.message = 'account_id is required';
                return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
            }

            const passenger = await this.passengerService.restorePassenger(
                parseInt(passengerId),
                parseInt(account_id)
            );

            SuccessResponse.message = 'Passenger restored successfully';
            SuccessResponse.data = passenger;
            return res.status(StatusCodes.OK).json(SuccessResponse);

        } catch (error) {
            console.error('Error in restorePassenger:', error);
            ErrorResponse.error = error;
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
        }
    };

    /**
     * ✅ NEW: GET /api/v1/passengers/search/:accountId
     * Search passengers by name
     */
    searchPassengers = async (req, res) => {
        try {
            const { accountId } = req.params;
            const { q } = req.query;

            if (!q) {
                ErrorResponse.message = 'Search term (q) is required';
                return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
            }

            const passengers = await this.passengerService.searchPassengers(parseInt(accountId), q);

            SuccessResponse.message = 'Passengers search completed';
            SuccessResponse.data = passengers;
            return res.status(StatusCodes.OK).json(SuccessResponse);

        } catch (error) {
            console.error('Error in searchPassengers:', error);
            ErrorResponse.error = error;
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
        }
    };

    /**
     * ✅ NEW: GET /api/v1/passengers/stats/:accountId
     * Get passenger statistics
     */
    getPassengerStats = async (req, res) => {
        try {
            const { accountId } = req.params;

            const stats = await this.passengerService.getPassengerStats(parseInt(accountId));

            SuccessResponse.message = 'Passenger statistics retrieved successfully';
            SuccessResponse.data = stats;
            return res.status(StatusCodes.OK).json(SuccessResponse);

        } catch (error) {
            console.error('Error in getPassengerStats:', error);
            ErrorResponse.error = error;
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
        }
    };

    /**
     * ✅ EXISTING: POST /api/v1/passengers/validate
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