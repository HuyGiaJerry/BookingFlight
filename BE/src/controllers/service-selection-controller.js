const { StatusCodes } = require('http-status-codes');
const ServiceSelectionService = require('../services/service-selection-service');
const SessionManagerService = require('../services/session-manager-service');

class ServiceSelectionController {
    constructor() {
        this.serviceSelectionService = new ServiceSelectionService();
    }

    /**
     * 🍽️ Add meal selection cho passenger
     * POST /api/v1/service-selection/add-meal
     */
    addMealSelection = async (req, res) => {
        try {
            const payload = req.body;

            if (!payload.flight_schedule_id || payload.passenger_index === undefined || !payload.service_offer_id) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'flight_schedule_id, passenger_index, and service_offer_id are required'
                });
            }

            console.log('🍽️ Adding meal selection:', payload);

            const result = await this.serviceSelectionService.addMealSelection(payload);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Meal selection added successfully',
                data: result
            });

        } catch (error) {
            console.error('Error adding meal selection:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to add meal selection'
            });
        }
    };

    /**
     * 🎒 Add baggage selection cho passenger  
     * POST /api/v1/service-selection/add-baggage
     */
    addBaggageSelection = async (req, res) => {
        try {
            const payload = req.body;

            if (!payload.flight_schedule_id || payload.passenger_index === undefined || !payload.service_offer_id) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'flight_schedule_id, passenger_index, and service_offer_id are required'
                });
            }

            console.log('🎒 Adding baggage selection:', payload);

            const result = await this.serviceSelectionService.addBaggageSelection(payload);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Baggage selection added successfully',
                data: result
            });

        } catch (error) {
            console.error('Error adding baggage selection:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to add baggage selection'
            });
        }
    };

    /**
     * 🛠️ Select multiple services cho flight
     * POST /api/v1/service-selection/select-services
     */
    selectServicesForFlight = async (req, res) => {
        try {
            const payload = req.body;

            if (!payload.flight_schedule_id || !payload.service_selections || !Array.isArray(payload.service_selections)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'flight_schedule_id and service_selections array are required'
                });
            }

            console.log(`🛠️ Selecting ${payload.service_selections.length} services for flight ${payload.flight_schedule_id}`);

            const result = await this.serviceSelectionService.selectServicesForFlight(payload);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Services selected successfully',
                data: result
            });

        } catch (error) {
            console.error('Error selecting services for flight:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to select services'
            });
        }
    };

    /**
     * 🗑️ Remove meal selection
     * DELETE /api/v1/service-selection/remove-meal
     */
    removeMealSelection = async (req, res) => {
        try {
            const payload = req.body;

            if (!payload.booking_session_id || !payload.flight_schedule_id ||
                payload.passenger_index === undefined) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'booking_session_id, flight_schedule_id, and passenger_index are required'
                });
            }

            const result = await this.serviceSelectionService.removeMealSelection(payload);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Meal selection removed successfully',
                data: result
            });

        } catch (error) {
            console.error('Error removing meal selection:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to remove meal selection'
            });
        }
    };

    /**
     * 🗑️ Remove baggage selection
     * DELETE /api/v1/service-selection/remove-baggage
     */
    removeBaggageSelection = async (req, res) => {
        try {
            const payload = req.body;

            if (!payload.booking_session_id || !payload.flight_schedule_id ||
                payload.passenger_index === undefined) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'booking_session_id, flight_schedule_id, and passenger_index are required'
                });
            }

            const result = await this.serviceSelectionService.removeBaggageSelection(payload);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Baggage selection removed successfully',
                data: result
            });

        } catch (error) {
            console.error('Error removing baggage selection:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to remove baggage selection'
            });
        }
    };

    /**
     * 📊 Get current service selections cho session
     * GET /api/v1/service-selection/:sessionId
     */
    getSessionServiceSelections = async (req, res) => {
        try {
            const { sessionId } = req.params;

            if (!sessionId) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'Session ID is required'
                });
            }

            const selections = await this.serviceSelectionService.getSessionServiceSelections(sessionId);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Service selections retrieved successfully',
                data: selections
            });

        } catch (error) {
            console.error('Error getting service selections:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to get service selections'
            });
        }
    };

    /**
     * ✅ Complete service selection process
     * POST /api/v1/service-selection/:sessionId/complete
     */
    completeServiceSelection = async (req, res) => {
        try {
            const { sessionId } = req.params;

            if (!sessionId) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'Session ID is required'
                });
            }

            console.log(`🎯 Completing service selection for session ${sessionId}`);

            const completionResult = await this.serviceSelectionService.completeServiceSelection(sessionId);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Service selection completed successfully',
                data: completionResult
            });

        } catch (error) {
            console.error('Error completing service selection:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to complete service selection'
            });
        }
    };

    /**
     * 🔄 Extend session expiry
     */
    extendSession = async (req, res) => {
        try {
            const { sessionId } = req.params;
            const { minutes = 15 } = req.body;

            // ✅ SỬA: Gọi static method
            const session = await SessionManagerService.extendSession(sessionId, minutes);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Session extended successfully',
                data: {
                    session_id: sessionId,
                    extended_by_minutes: minutes,
                    new_expiry: session.expire_at
                }
            });

        } catch (error) {
            console.error('Error extending session:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to extend session'
            });
        }
    };
}

module.exports = ServiceSelectionController;