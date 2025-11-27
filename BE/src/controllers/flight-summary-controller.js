const { StatusCodes } = require('http-status-codes');
const { FlightSummaryService } = require('../services');

class FlightSummaryController {
    constructor() {
        this.flightSummaryService = new FlightSummaryService();
    }

    /**
     * 🔸 GET /api/v1/flights/summary?flight_schedules=123,456
     * Get summary for selected flights
     */
    getFlightsSummary = async (req, res) => {
        try {
            const { flight_schedules } = req.query;

            if (!flight_schedules) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'Flight schedule IDs are required',
                    error: null
                });
            }

            const flightScheduleIds = Array.isArray(flight_schedules)
                ? flight_schedules.map(id => parseInt(id))
                : flight_schedules.split(',').map(id => parseInt(id.trim()));

            const summary = await this.flightSummaryService.getSelectedFlightsSummary(flightScheduleIds);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Flight summary retrieved successfully',
                data: summary
            });

        } catch (error) {
            console.error('Error in getFlightsSummary:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Internal server error',
                error: null
            });
        }
    };
}

module.exports = FlightSummaryController;