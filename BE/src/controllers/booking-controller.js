const { StatusCodes } = require('http-status-codes');
const { BookingService, BookingPageService } = require('../services');
const { SuccessResponse, ErrorResponse } = require('../utils/common');

class BookingController {
    constructor() {
        this.bookingService = new BookingService();
        this.bookingPageService = new BookingPageService();
    }

    /**
     * 🔸 GET /api/v1/booking/page-data
     * Load data for single booking page
     */
    getBookingPageData = async (req, res) => {
        try {
            const { flight_schedules, account_id } = req.query;

            if (!flight_schedules) {
                // ✅ SỬA: Tạo object ErrorResponse mới
                const errorResponse = {
                    success: false,
                    message: 'Flight schedule IDs are required',
                    error: null
                };
                return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
            }

            // Parse flight schedule IDs
            const flightScheduleIds = Array.isArray(flight_schedules)
                ? flight_schedules.map(id => parseInt(id))
                : flight_schedules.split(',').map(id => parseInt(id.trim()));

            console.log('Parsed flight schedule IDs:', flightScheduleIds);

            const pageData = await this.bookingPageService.getBookingPageData(
                flightScheduleIds,
                account_id ? parseInt(account_id) : null
            );

            // ✅ SỬA: Tạo object SuccessResponse mới
            const successResponse = {
                success: true,
                message: 'Booking page data retrieved successfully',
                data: pageData
            };
            return res.status(StatusCodes.OK).json(successResponse);

        } catch (error) {
            console.error('Error in getBookingPageData:', error);

            // ✅ SỬA: Tạo object ErrorResponse mới
            const errorResponse = {
                success: false,
                message: error.message || 'Internal server error',
                error: error.statusCode ? error : null
            };
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
        }
    };

    /**
     * 🔸 POST /api/v1/booking/validate-form
     * Validate booking form before submission
     */
    validateBookingForm = async (req, res) => {
        try {
            const formData = req.body;

            const validation = await this.bookingPageService.validateBookingForm(formData);

            const successResponse = {
                success: true,
                message: validation.is_valid ? 'Form validation passed' : 'Form validation failed',
                data: validation
            };
            return res.status(StatusCodes.OK).json(successResponse);

        } catch (error) {
            console.error('Error in validateBookingForm:', error);
            const errorResponse = {
                success: false,
                message: error.message || 'Internal server error',
                error: error.statusCode ? error : null
            };
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
        }
    };

    /**
     * 🔸 POST /api/v1/booking/calculate-preview
     * Calculate booking pricing preview
     */
    calculateBookingPreview = async (req, res) => {
        try {
            const formData = req.body;

            const pricing = await this.bookingPageService.calculateBookingPreview(formData);

            const successResponse = {
                success: true,
                message: 'Pricing calculated successfully',
                data: pricing
            };
            return res.status(StatusCodes.OK).json(successResponse);

        } catch (error) {
            console.error('Error in calculateBookingPreview:', error);
            const errorResponse = {
                success: false,
                message: error.message || 'Internal server error',
                error: error.statusCode ? error : null
            };
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
        }
    };

    /**
     * 🔸 POST /api/v1/booking/summary
     * Get booking summary for confirmation
     */
    getBookingSummary = async (req, res) => {
        try {
            const bookingData = req.body;

            const summary = await this.bookingPageService.getBookingSummary(bookingData);

            const successResponse = {
                success: true,
                message: 'Booking summary generated successfully',
                data: summary
            };
            return res.status(StatusCodes.OK).json(successResponse);

        } catch (error) {
            console.error('Error in getBookingSummary:', error);
            const errorResponse = {
                success: false,
                message: error.message || 'Internal server error',
                error: error.statusCode ? error : null
            };
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
        }
    };

    /**
     * 🔸 POST /api/v1/booking/create-complete
     * Create complete booking (single-page submission)
     */
    createCompleteBooking = async (req, res) => {
        try {
            const bookingData = req.body;

            // Validate required fields
            if (!bookingData.contact_info || !bookingData.passengers || !bookingData.flight_selections) {
                const errorResponse = {
                    success: false,
                    message: 'Missing required booking data',
                    error: null
                };
                return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
            }

            const booking = await this.bookingService.createCompleteBooking(bookingData);

            const successResponse = {
                success: true,
                message: 'Booking created successfully',
                data: booking
            };
            return res.status(StatusCodes.CREATED).json(successResponse);

        } catch (error) {
            console.error('Error in createCompleteBooking:', error);
            const errorResponse = {
                success: false,
                message: error.message || 'Internal server error',
                error: error.statusCode ? error : null
            };
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
        }
    };

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

    /**
     * 🔸 GET /api/v1/booking/code/:bookingCode
     * Get booking by booking code
     */
    getBookingByCode = async (req, res) => {
        try {
            const { bookingCode } = req.params;

            const booking = await this.bookingService.bookingRepository.getBookingByCode(bookingCode);

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
                message: 'Booking retrieved successfully',
                data: booking
            };
            return res.status(StatusCodes.OK).json(successResponse);

        } catch (error) {
            console.error('Error in getBookingByCode:', error);
            const errorResponse = {
                success: false,
                message: error.message || 'Internal server error',
                error: error.statusCode ? error : null
            };
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
        }
    };

    /**
     * 🔸 GET /api/v1/booking/user/:accountId
     * Get user bookings with pagination
     */
    getUserBookings = async (req, res) => {
        try {
            const { accountId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const bookings = await this.bookingService.bookingRepository.getUserBookings(
                accountId,
                parseInt(page),
                parseInt(limit)
            );

            const successResponse = {
                success: true,
                message: 'User bookings retrieved successfully',
                data: bookings
            };
            return res.status(StatusCodes.OK).json(successResponse);

        } catch (error) {
            console.error('Error in getUserBookings:', error);
            const errorResponse = {
                success: false,
                message: error.message || 'Internal server error',
                error: error.statusCode ? error : null
            };
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
        }
    };

    /**
     * ✅ SIMPLIFIED: Chỉ get basic booking data
     * GET /api/v1/booking/basic-data?account_id=1
     */
    getBookingBasicData = async (req, res) => {
        try {
            const { account_id } = req.query;

            const basicData = await this.bookingPageService.getBookingBasicData(
                account_id ? parseInt(account_id) : null
            );

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Booking basic data retrieved successfully',
                data: basicData
            });

        } catch (error) {
            console.error('Error in getBookingBasicData:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Internal server error',
                error: null
            });
        }
    };

    /**
     * ✅ THÊM: Mock auto-assign pending seats (tạm thời)
     * POST /api/v1/booking/auto-assign-seats
     */
    autoAssignPendingSeats = async (req, res) => {
        try {
            const { session_id } = req.body;

            if (!session_id) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'session_id is required'
                });
            }

            // ✅ TẠM THỜI: Mock auto-assignment
            const mockResult = {
                session_id: session_id,
                auto_assigned_seats: [
                    {
                        flight_schedule_id: 123,
                        passenger_index: 2,
                        flight_seat_id: 99999,
                        seat_number: 'AUTO-1A',
                        seat_charges: 0
                    }
                ],
                total_auto_assigned: 1,
                updated_at: new Date()
            };

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Pending seats auto-assigned successfully (MOCK)',
                data: mockResult
            });

        } catch (error) {
            console.error('Error auto-assigning pending seats:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to auto-assign seats'
            });
        }
    };

    /**
     * ✅ THÊM: Mock create booking from session (tạm thời)
     * POST /api/v1/booking/create-from-session
     */
    createBookingFromSession = async (req, res) => {
        try {
            const bookingData = req.body;

            if (!bookingData.booking_session_id) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'booking_session_id is required'
                });
            }

            // ✅ TẠM THỜI: Mock booking creation
            const mockBooking = {
                booking_id: Math.floor(Math.random() * 10000),
                booking_code: `MOCK${Date.now()}`,
                total_amount: 2500000,
                passengers_count: 3,
                tickets_count: 3,
                flights_count: 1,
                seat_breakdown: {
                    user_selected_seats: 2,
                    auto_assigned_seats: 1,
                    total_seat_charges: 350000
                },
                status: 'confirmed',
                payment_status: 'pending',
                created_at: new Date()
            };

            return res.status(StatusCodes.CREATED).json({
                success: true,
                message: 'Booking created successfully from session (MOCK)',
                data: mockBooking
            });

        } catch (error) {
            console.error('Error creating booking from session:', error);
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || 'Failed to create booking'
            });
        }
    };
}

module.exports = BookingController;