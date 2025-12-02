const { StatusCodes } = require('http-status-codes');
const { BookingSession } = require('../models');

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
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'booking_session_id, contact_info, and passengers are required',
                    status: StatusCodes.BAD_REQUEST
                });
            }

            const session = await BookingSession.findByPk(booking_session_id);
            if (!session) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: 'Booking session not found',
                    status: StatusCodes.NOT_FOUND
                });
            }

            // Cập nhật session_data
            const sessionData = session.session_data || {};
            sessionData.contact_info = contact_info;
            sessionData.passenger_details = passengers; // <-- Lưu vào đúng trường

            const [affectedRows] = await BookingSession.update(
                { session_data: sessionData },
                { where: { id: booking_session_id } }
            );
            console.log('Affected rows:', affectedRows);
            await session.reload();
            console.log('Updated session_data:', session.session_data);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: 'Contact and passengers saved to session',
                data: { booking_session_id: booking_session_id },
                status: StatusCodes.OK
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = BookingSessionController;