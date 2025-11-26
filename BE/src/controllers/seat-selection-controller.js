const { StatusCodes } = require('http-status-codes');
const SeatSelectionService = require('../services/seat-selection-service');

class SeatSelectionController {
    constructor() {
        this.seatSelectionService = new SeatSelectionService();
    }

    /**
     * 🎯 Select individual seat (REAL-TIME)
     * POST /api/v1/seat-selection/select-seat
     * User clicks 1 seat → instant update
     */
    selectIndividualSeat = async (req, res) => {
        try {
            const payload = req.body;

            // ✅ VALIDATION mạnh hơn
            if (!payload.booking_session_id) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'booking_session_id is required. Please start from flight selection.',
                    error_code: 'SESSION_ID_REQUIRED'
                });
            }

            if (!payload.flight_schedule_id || payload.passenger_index === undefined || !payload.flight_seat_id) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'flight_schedule_id, passenger_index, and flight_seat_id are required'
                });
            }

            console.log('🎯 Seat selection request:', payload);

            const result = await this.seatSelectionService.selectIndividualSeat(payload);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Seat selected successfully',
                data: result
            });

        } catch (error) {
            console.error('Error selecting seat:', error);

            // ✅ SPECIFIC error handling cho session issues
            if (error.message.includes('Session not found') || error.message.includes('start from flight selection')) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: error.message,
                    error_code: 'SESSION_INVALID',
                    redirect_url: '/flights'
                });
            }

            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to select seat'
            });
        }
    };

    /**
     * 🗑️ Remove seat for passenger (REAL-TIME)
     * DELETE /api/v1/seat-selection/remove-seat
     * User unselects seat → instant update
     */
    removeSeatForPassenger = async (req, res) => {
        try {
            const {
                booking_session_id,
                flight_schedule_id,
                passenger_index
            } = req.body;

            if (!booking_session_id || !flight_schedule_id || typeof passenger_index !== 'number') {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'booking_session_id, flight_schedule_id, and passenger_index are required'
                });
            }

            const result = await this.seatSelectionService.removeSeatForPassenger({
                booking_session_id,
                flight_schedule_id: parseInt(flight_schedule_id),
                passenger_index
            });

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Seat removed successfully',
                data: result
            });

        } catch (error) {
            console.error('Error in removeSeatForPassenger:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message
            });
        }
    };

    /**
     * 📊 Get session selections (for page reload)
     * GET /api/v1/seat-selection/:sessionId
     */
    getSessionSelections = async (req, res) => {
        try {
            const { sessionId } = req.params;

            if (!sessionId) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'Session ID is required'
                });
            }

            const selections = await this.seatSelectionService.getSessionSeatSelections(sessionId);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Session selections retrieved successfully',
                data: selections
            });

        } catch (error) {
            console.error('Error in getSessionSelections:', error);
            return res.status(error.statusCode || StatusCodes.NOT_FOUND).json({
                success: false,
                message: error.message || 'Session not found'
            });
        }
    };

    /**
     * ❌ Cancel all seat selections
     * DELETE /api/v1/seat-selection/:sessionId
     */
    cancelSeatSelections = async (req, res) => {
        try {
            const { sessionId } = req.params;

            const result = await this.seatSelectionService.releaseAllSessionSeats(sessionId);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Seat selections cancelled successfully',
                data: {
                    session_id: sessionId,
                    seats_released: result,
                    cancelled_at: new Date()
                }
            });

        } catch (error) {
            console.error('Error in cancelSeatSelections:', error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to cancel selections'
            });
        }
    };

    /**
     * 🔄 Extend session expiry
     * PUT /api/v1/seat-selection/:sessionId/extend
     */
    extendSession = async (req, res) => {
        try {
            const { sessionId } = req.params;
            const { minutes = 15 } = req.body;

            const result = await this.seatSelectionService.extendSession(sessionId, minutes);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Session extended successfully',
                data: result
            });

        } catch (error) {
            console.error('Error in extendSession:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to extend session'
            });
        }
    };

    /**
     * ✅ SỬA: Complete seat selection process
     * CHỨC NĂNG: User nhấn "Done" trong popup → Chuẩn bị data cho booking page
     * POST /api/v1/seat-selection/:sessionId/complete
     */
    completeSeatSelection = async (req, res) => {
        try {
            const { sessionId } = req.params;
            const { passengers_count } = req.body; // ✅ THÊM: Nhận passengers_count từ frontend

            if (!sessionId) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'Session ID is required'
                });
            }

            // ✅ VALIDATE passengers_count
            if (!passengers_count || passengers_count < 1 || passengers_count > 9) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'passengers_count is required and must be between 1-9'
                });
            }

            console.log(`🎯 Completing seat selection for session ${sessionId}`);
            console.log(`👥 Frontend passengers_count: ${passengers_count}`);

            // ✅ PASS passengers_count to service
            const completionResult = await this.seatSelectionService.completeSeatSelection(
                sessionId,
                passengers_count  // ✅ THÊM parameter
            );

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Seat selection completed successfully',
                data: completionResult
            });

        } catch (error) {
            console.error('Error completing seat selection:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to complete seat selection'
            });
        }
    };
}

module.exports = SeatSelectionController;