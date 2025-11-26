const { StatusCodes } = require('http-status-codes');
const FlightSelectionService = require('../services/flight-selection-service');

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

            console.log('🛫 Creating flight selection session:', payload);

            const result = await this.flightSelectionService.createFlightSelectionSession(payload);

            return res.status(StatusCodes.CREATED).json({
                success: true,
                message: 'Flight selection session created successfully',
                data: result
            });

        } catch (error) {
            console.error('Error creating flight selection session:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to create flight selection session'
            });
        }
    };

    /**
     * 📊 GET: Session data
     * GET /api/v1/flight-selection/session/:sessionId
     */
    getFlightSelectionSession = async (req, res) => {
        try {
            const { sessionId } = req.params;

            if (!sessionId) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'Session ID is required'
                });
            }

            const sessionData = await this.flightSelectionService.getFlightSelectionSession(sessionId);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Session data retrieved successfully',
                data: sessionData
            });

        } catch (error) {
            console.error('Error getting flight selection session:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to get session data'
            });
        }
    };
}

module.exports = FlightSelectionController;