const {
    Booking, BookingFlight, BookingPassenger, Ticket, BookingServiceItem,
    FlightSeat, BookingSession, sequelize
} = require('../models');
const AppError = require('../utils/errors/app-error');

class BookingService {
    constructor() {
        // repositories would be injected
    }

    /**
     * 🎫 Create complete booking từ booking session
     */
    // async createBookingFromSession(payload) {
    //     const transaction = await sequelize.transaction();

    //     try {
    //         const {
    //             booking_session_id,
    //             account_id,
    //             passengers,           // Passenger info
    //             contact_info,         // {email, phone}
    //             payment_method = null
    //         } = payload;

    //         console.log('🎫 Creating booking from session:', booking_session_id);

    //         // 1. Get complete session data
    //         const session = await BookingSession.findByPk(booking_session_id);
    //         if (!session) {
    //             throw new AppError('Booking session not found', 404);
    //         }

    //         if (session.expire_at < new Date()) {
    //             throw new AppError('Booking session expired', 410);
    //         }

    //         const sessionData = session.session_data || {};

    //         // 2. Generate booking code
    //         const bookingCode = this.generateBookingCode();

    //         // 3. Create main booking
    //         const booking = await Booking.create({
    //             booking_code: bookingCode,
    //             account_id,
    //             contact_email: contact_info.email,
    //             contact_phone: contact_info.phone,
    //             total_amount: session.total_estimate,
    //             status: 'confirmed',
    //             payment_status: payment_method ? 'paid' : 'pending',
    //             confirmed_at: new Date()
    //         }, { transaction });

    //         // 4. Create passengers
    //         const bookingPassengers = await Promise.all(
    //             passengers.map(async (passenger) => {
    //                 return await BookingPassenger.create({
    //                     booking_id: booking.id,
    //                     passenger_id: passenger.passenger_id || null,
    //                     fullname: passenger.fullname,
    //                     gender: passenger.gender,
    //                     date_of_birth: passenger.date_of_birth,
    //                     nationality: passenger.nationality,
    //                     passenger_type: passenger.passenger_type || 'adult',
    //                     passport_number: passenger.passport_number,
    //                     passport_expiry: passenger.passport_expiry,
    //                     id_card_number: passenger.id_card_number
    //                 }, { transaction });
    //             })
    //         );

    //         // 5. Process each flight
    //         const allTickets = [];
    //         const seatSelections = sessionData.seat_selections || {};

    //         for (const [flightScheduleId, selections] of Object.entries(seatSelections)) {
    //             // Create booking flight
    //             const bookingFlight = await BookingFlight.create({
    //                 booking_id: booking.id,
    //                 flight_schedule_id: parseInt(flightScheduleId),
    //                 flight_type: 'outbound'
    //             }, { transaction });

    //             // Book seats and create tickets
    //             const passengerSelections = selections.passenger_selections || [];
    //             const seatIds = passengerSelections.map(s => s.flight_seat_id);

    //             // Book the seats
    //             await FlightSeat.update({
    //                 status: 'booked',
    //                 booked_at: new Date(),
    //                 blocked_session_id: null,
    //                 blocked_at: null,
    //                 blocked_until: null
    //             }, {
    //                 where: {
    //                     id: seatIds,
    //                     blocked_session_id: booking_session_id
    //                 },
    //                 transaction
    //             });

    //             // Create tickets for each passenger
    //             for (const selection of passengerSelections) {
    //                 const passenger = bookingPassengers[selection.passenger_index];
    //                 const seatPricing = selections.seat_pricing.seats.find(
    //                     s => s.flight_seat_id === selection.flight_seat_id
    //                 );

    //                 const ticketNumber = this.generateTicketNumber(bookingCode, flightScheduleId, selection.passenger_index);

    //                 const ticket = await Ticket.create({
    //                     ticket_number: ticketNumber,
    //                     booking_id: booking.id,
    //                     booking_flight_id: bookingFlight.id,
    //                     booking_passenger_id: passenger.id,
    //                     flight_seat_id: selection.flight_seat_id,
    //                     seat_number: seatPricing.seat_number,
    //                     base_fare: seatPricing.base_price,
    //                     seat_adjustment: seatPricing.adjustment,
    //                     tax: 0, // Calculate if needed
    //                     service_fee: 0,
    //                     total_amount: seatPricing.final_price,
    //                     status: 'issued',
    //                     issued_at: new Date()
    //                 }, { transaction });

    //                 allTickets.push(ticket);

    //                 // Add service items (meals, baggage) if any
    //                 await this.createServiceItems(
    //                     sessionData,
    //                     flightScheduleId,
    //                     booking.id,
    //                     bookingFlight.id,
    //                     passenger.id,
    //                     ticket.id,
    //                     selection.passenger_index,
    //                     transaction
    //                 );
    //             }
    //         }

    //         // 6. Clear session
    //         await BookingSession.destroy({
    //             where: { id: booking_session_id }
    //         }, { transaction });

    //         await transaction.commit();

    //         return {
    //             booking_id: booking.id,
    //             booking_code: bookingCode,
    //             total_amount: session.total_estimate,
    //             passengers_count: bookingPassengers.length,
    //             tickets_count: allTickets.length,
    //             flights_count: Object.keys(seatSelections).length,
    //             status: 'confirmed',
    //             payment_status: booking.payment_status
    //         };

    //     } catch (error) {
    //         await transaction.rollback();
    //         console.error('❌ Error creating booking from session:', error);
    //         throw error;
    //     }
    // }

    /**
     * 🍽️ Create service items (meals, baggage) for passenger
     */
    async createServiceItems(sessionData, flightScheduleId, bookingId, bookingFlightId, passengerId, ticketId, passengerIndex, transaction) {
        try {
            const serviceSelections = sessionData.service_selections?.[flightScheduleId] || {};

            // Process meals
            if (serviceSelections.meals) {
                const mealSelections = serviceSelections.meals.selections || [];
                const passengerMeals = mealSelections.filter(m => m.passenger_index === passengerIndex);

                for (const mealSelection of passengerMeals) {
                    const pricing = serviceSelections.meals.pricing.services.find(
                        s => s.service_offer_id === mealSelection.service_offer_id
                    );

                    await BookingServiceItem.create({
                        booking_id: bookingId,
                        booking_flight_id: bookingFlightId,
                        booking_passenger_id: passengerId,
                        ticket_id: ticketId,
                        flight_service_offer_id: mealSelection.service_offer_id,
                        service_option_id: pricing.service_option_id,
                        quantity: mealSelection.quantity || 1,
                        unit_price: pricing.unit_price,
                        total_price: pricing.total_price,
                        status: 'purchased'
                    }, { transaction });
                }
            }

            // Process baggage (similar logic)
            if (serviceSelections.baggage) {
                // Similar implementation for baggage
            }

        } catch (error) {
            console.error('Error creating service items:', error);
            throw error;
        }
    }

    // Helper methods
    generateBookingCode() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `BK${timestamp}${random}`;
    }

    generateTicketNumber(bookingCode, flightId, passengerIndex) {
        return `${bookingCode}-F${flightId}-P${(passengerIndex + 1).toString().padStart(2, '0')}`;
    }
}

module.exports = BookingService;