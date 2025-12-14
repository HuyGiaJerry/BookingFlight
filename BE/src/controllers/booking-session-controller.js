const { StatusCodes } = require('http-status-codes');
const { BookingSession } = require('../models');
const { Responses } = require('../utils/common');

class BookingSessionController {
    /**
     * POST /api/v1/booking-session/save-contact-passengers
     * Body: { booking_session_id, contact_info, passengers }
     */
    saveContactAndPassengers = async (req, res, next) => {
        try {
            const { booking_session_id, contact_info, passengers } = req.body;
            console.log('Saving contact and passengers:', { booking_session_id, contact_info, passengers });

            if (!booking_session_id || !contact_info || !Array.isArray(passengers) || passengers.length === 0) {
                return res.status(StatusCodes.BAD_REQUEST).json(Responses.ErrorResponse("Missing Fields", "booking_session_id, contact_info, and passengers are required", StatusCodes.BAD_REQUEST));
            }

            const session = await BookingSession.findByPk(booking_session_id);
            if (!session) {
                return res.status(StatusCodes.NOT_FOUND).json(Responses.ErrorResponse("Not Found", "Booking session not found", StatusCodes.NOT_FOUND));
            }

            // Cập nhật session_data
            const sessionData = session.session_data || {};
            sessionData.contact_info = contact_info;
            sessionData.passenger_details = passengers;

            const [affectedRows] = await BookingSession.update(
                { session_data: sessionData },
                { where: { id: booking_session_id } }
            );
            await session.reload();
            console.log('Updated session_data:', session.session_data);

            return res.status(StatusCodes.OK).json(Responses.SuccessResponse({ booking_session_id: booking_session_id }, "Contact and passengers saved to session", StatusCodes.OK));
        } catch (error) {
            next(error);
        }
    };


    getBookingSessionById = async (req, res, next) => {
        try {
            const {booking_session_id} = req.params;
            const session = await BookingSession.findByPk(booking_session_id);
            if (!session) {
                return res.status(StatusCodes.NOT_FOUND).json(Responses.ErrorResponse("Not Found", "Booking session not found", StatusCodes.NOT_FOUND));
            }

            return res.status(StatusCodes.OK).json(Responses.SuccessResponse(session, "Booking session retrieved", StatusCodes.OK));
        } catch (error) {
            next(error);
        }
    };

    


}

module.exports = BookingSessionController;