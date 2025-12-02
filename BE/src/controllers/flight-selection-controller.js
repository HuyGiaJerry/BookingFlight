const { StatusCodes } = require('http-status-codes');
const FlightSelectionService = require('../services/flight-selection-service');
const { Responses } = require('../utils/common');

class FlightSelectionController {
    constructor() {
        this.flightSelectionService = new FlightSelectionService();
    }

    /**
     * 🛫 CREATE: Tạo Booking Session từ flight selection
     * POST /api/v1/flight-selection/create-session
     */
    createFlightSelectionSession = async (req, res, next) => {
        try {
            const payload = req.body;

            if (!payload.outbound_flight_id || !payload.seat_class_name) {
                return res.status(StatusCodes.BAD_REQUEST).json(
                    Responses.ErrorResponse(
                        'outbound_flight_id and seat_class_name are required',
                        'outbound_flight_id and seat_class_name are required',
                        StatusCodes.BAD_REQUEST
                    )
                );
            }

            const result = await this.flightSelectionService.createFlightSelectionSession(payload);

            return res
                .status(StatusCodes.CREATED)
                .json(Responses.SuccessResponse(result, 'BookingSession created successfully', StatusCodes.CREATED));
        } catch (error) {
            console.error('Error creating flight selection session:', error);
            next(error);
        }
    };
}

module.exports = FlightSelectionController;