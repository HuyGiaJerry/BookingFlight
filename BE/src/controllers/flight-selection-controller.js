const { StatusCodes } = require('http-status-codes');
const FlightSelectionService = require('../services/flight-selection-service');
const { Responses } = require('../utils/common');

class FlightSelectionController {
    constructor() {
        this.flightSelectionService = new FlightSelectionService();
    }

    /**
     * 🛫 CREATE: Tạo session từ flight selection
     * POST /api/v1/flight-selection/create-session
     */
    createFlightSelectionSession = async (req, res) => {
        try {
            const payload = req.body;

            if (!payload.outbound_flight_id || !payload.passengers_count || !payload.seat_class_id) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'outbound_flight_id, passengers_count, and seat_class_id are required'
                });
            }

            const result = await this.flightSelectionService.createFlightSelectionSession(payload);

            return res.status(StatusCodes.CREATED).json(Responses.SuccessResponse(result, 'BoookingSession created successfully'));

        } catch (error) {
            console.error('Error creating flight selection session:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(Responses.ErrorResponse(error.message || 'Failed to create flight selection session'));
        }
    };
}

module.exports = FlightSelectionController;