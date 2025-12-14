const { StatusCodes } = require('http-status-codes');
const { BookingService } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

class BookingController {
    constructor() {
        this.bookingService = new BookingService();
    }
    
    /**
     * 🔸 GET /api/v1/booking/:bookingId
     * Get booking details by ID
     */
    getBookingDetails = async (req, res) => {
        try {
            const { bookingId } = req.params;

            const booking = await this.bookingService.bookingRepository.getBookingDetails(bookingId);

            if (!booking) {
                const errorResponse = {
                    success: false,
                    message: 'Booking not found',
                    error: null
                };
                return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
            }

            const successResponse = {
                success: true,
                message: 'Booking details retrieved successfully',
                data: booking
            };
            return res.status(StatusCodes.OK).json(successResponse);

        } catch (error) {
            console.error('Error in getBookingDetails:', error);
            const errorResponse = {
                success: false,
                message: error.message || 'Internal server error',
                error: error.statusCode ? error : null
            };
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
        }
    };

}

module.exports = BookingController;