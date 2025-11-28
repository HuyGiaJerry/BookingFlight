const { StatusCodes } = require('http-status-codes');
const { SeatService } = require('../services');

class SeatController {
    constructor() {
        this.seatService = new SeatService();
    }

    /**
     * ✅ UPDATED: Get seat matrix với class filter
     * 🔸 GET /api/v1/seats/matrix/:flightScheduleId?classId=1
     */
    getSeatMatrix = async (req, res) => {
        try {
            const { flightScheduleId } = req.params;
            const { classId } = req.query; // ✅ THÊM: Query parameter cho class filter

            const seatClassId = classId ? parseInt(classId) : null;

            const seatMatrix = await this.seatService.getTravelokaSeatMatrix(
                parseInt(flightScheduleId),
                seatClassId
            );

            return res.status(StatusCodes.OK).json({
                success: true,
                message: `Seat matrix retrieved successfully${seatClassId ? ' for class ' + seatClassId : ''}`,
                data: seatMatrix
            });

        } catch (error) {
            console.error('Error in getSeatMatrix:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    };

    /**
     * ✅ NEW: Get seat count summary by class
     * 🔸 GET /api/v1/seats/summary/:flightScheduleId
     */
    getSeatSummary = async (req, res) => {
        try {
            const { flightScheduleId } = req.params;

            const summary = await this.seatService.getSeatClassSummary(parseInt(flightScheduleId));

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Seat class summary retrieved successfully',
                data: {
                    flight_schedule_id: parseInt(flightScheduleId),
                    classes: summary
                }
            });

        } catch (error) {
            console.error('Error in getSeatSummary:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    };

    /**
     * ✅ NEW: Get seats for specific class only
     * 🔸 GET /api/v1/seats/class/:flightScheduleId/:classId
     */
    getSeatsByClass = async (req, res) => {
        try {
            const { flightScheduleId, classId } = req.params;

            const seatMatrix = await this.seatService.getSeatsByClass(
                parseInt(flightScheduleId),
                parseInt(classId)
            );

            return res.status(StatusCodes.OK).json({
                success: true,
                message: `Seats for class ${classId} retrieved successfully`,
                data: seatMatrix
            });

        } catch (error) {
            console.error('Error in getSeatsByClass:', error);
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
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'seat_ids array is required'
                });
            }

            const availability = await this.seatService.seatRepository.checkSeatAvailability(seat_ids);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Seat availability checked successfully',
                data: availability
            });

        } catch (error) {
            console.error('Error in checkSeatAvailability:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    };

    /**
     * 🔸 GET /api/v1/seats/debug/:flightScheduleId
     * Debug seat layout issues
     */
    debugSeatLayout = async (req, res) => {
        try {
            const { flightScheduleId } = req.params;
            const { classId } = req.query; // ✅ THÊM: Class filter cho debug

            const seatClassId = classId ? parseInt(classId) : null;

            const seatMapData = await this.seatService.seatRepository.getFlightSeatMap(
                parseInt(flightScheduleId),
                seatClassId
            );

            if (!seatMapData?.seat_map) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: 'No seat data found'
                });
            }

            const { seat_map } = seatMapData;

            // Analyze seat layout
            const analysis = {
                flight_schedule_id: parseInt(flightScheduleId),
                seat_class_id: seatClassId,
                total_seats: seat_map.length,
                unique_columns: [...new Set(seat_map.map(s => s.seat_column))].sort(),
                unique_rows: [...new Set(seat_map.map(s => s.seat_row))].sort((a, b) => a - b),
                class_breakdown: {},
                seats_by_row: {},
                column_analysis: {}
            };

            // ✅ THÊM: Class breakdown
            seat_map.forEach(seat => {
                const classCode = seat.seat_class?.class_code || 'UNK';
                if (!analysis.class_breakdown[classCode]) {
                    analysis.class_breakdown[classCode] = 0;
                }
                analysis.class_breakdown[classCode]++;
            });

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
                message: `Seat layout analysis${seatClassId ? ' for class ' + seatClassId : ''}`,
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