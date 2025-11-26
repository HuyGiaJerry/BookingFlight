const { StatusCodes } = require('http-status-codes');
const { SeatService } = require('../services');

class SeatController {
    constructor() {
        this.seatService = new SeatService();
    }

    /**
     * ✅ NEW: Get Traveloka-style seat matrix
     * 🔸 GET /api/v1/seats/traveloka-matrix/:flightScheduleId
     */
    getSeatMatrix = async (req, res) => {
        try {
            const { flightScheduleId } = req.params;

            const seatMatrix = await this.seatService.getTravelokaSeatMatrix(parseInt(flightScheduleId));

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Traveloka seat matrix retrieved successfully',
                data: seatMatrix
            });

        } catch (error) {
            console.error('Error in getTravelokaSeatMatrix:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    };

    /**
     * 🔸 GET /api/v1/seats/pricing/:flightScheduleId
     * Get seat pricing information
     */
    getSeatPricing = async (req, res) => {
        try {
            const { flightScheduleId } = req.params;

            const pricing = await this.seatService.getSeatPricing(parseInt(flightScheduleId));

            SuccessResponse.message = 'Seat pricing retrieved successfully';
            SuccessResponse.data = pricing;
            return res.status(StatusCodes.OK).json(SuccessResponse);

        } catch (error) {
            console.error('Error in getSeatPricing:', error);
            ErrorResponse.error = error;
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
        }
    };

    /**
     * 🔸 POST /api/v1/seats/check-availability
     * Check multiple seat availability
     */
    checkSeatAvailability = async (req, res) => {
        try {
            const { seat_ids } = req.body;

            if (!seat_ids || !Array.isArray(seat_ids)) {
                ErrorResponse.message = 'seat_ids array is required';
                return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
            }

            const availability = await this.seatService.seatRepository.checkSeatAvailability(seat_ids);

            SuccessResponse.message = 'Seat availability checked successfully';
            SuccessResponse.data = availability;
            return res.status(StatusCodes.OK).json(SuccessResponse);

        } catch (error) {
            console.error('Error in checkSeatAvailability:', error);
            ErrorResponse.error = error;
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
        }
    };

    /**
     * 🔸 GET /api/v1/seats/debug/:flightScheduleId
     * Debug seat layout issues
     */
    debugSeatLayout = async (req, res) => {
        try {
            const { flightScheduleId } = req.params;

            const seatMapData = await this.seatService.seatRepository.getFlightSeatMap(parseInt(flightScheduleId));

            if (!seatMapData?.seat_map) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: 'No seat data found'
                });
            }

            const { seat_map } = seatMapData;

            // Analyze seat layout
            const analysis = {
                total_seats: seat_map.length,
                unique_columns: [...new Set(seat_map.map(s => s.seat_column))].sort(),
                unique_rows: [...new Set(seat_map.map(s => s.seat_row))].sort((a, b) => a - b),
                seats_by_row: {},
                column_analysis: {}
            };

            // Group seats by row
            seat_map.forEach(seat => {
                const row = seat.seat_row;
                if (!analysis.seats_by_row[row]) {
                    analysis.seats_by_row[row] = [];
                }
                analysis.seats_by_row[row].push({
                    seat_number: seat.seat_number,
                    column: seat.seat_column,
                    class: seat.seat_class?.class_code || 'UNK',
                    status: seat.status
                });
            });

            // Analyze columns
            analysis.unique_columns.forEach(col => {
                analysis.column_analysis[col] = seat_map.filter(s => s.seat_column === col).length;
            });

            // Sort seats in each row
            Object.keys(analysis.seats_by_row).forEach(row => {
                analysis.seats_by_row[row].sort((a, b) => a.column.localeCompare(b.column));
            });

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Seat layout analysis',
                data: analysis
            });

        } catch (error) {
            console.error('Error in debugSeatLayout:', error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message
            });
        }
    };
}

module.exports = SeatController;