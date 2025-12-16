const {Booking, BookingFlight, BookingPassenger, Ticket, BookingServiceItem,FlightSeat, BookingSession, sequelize, Payment} = require('../models');
const AppError = require('../utils/errors/app-error');
const {StatusCodes} = require('http-status-codes');
class BookingService {
    constructor() {
        // repositories would be injected
    }

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




    async confirmBooking({ bookingSessionId, amount, transactionId, rawData }) {
        console.log("✅ 1 Confirming booking for session:", bookingSessionId);
        // 1) Lấy session booking
        const session = await BookingSession.findByPk(bookingSessionId);
        if (!session) throw new AppError("BookingSession not found", StatusCodes.NOT_FOUND);

        // Nếu session_data là object, không cần parse
        const sessionData = typeof session.session_data === 'string'
            ? JSON.parse(session.session_data)
            : session.session_data;

        // Lấy đúng trường
        const contactInfo = sessionData.contact_info;
        const passengers = sessionData.passenger_details || [];
        const flightsObj = sessionData.flights || {};
        const seatSelections = sessionData.seat_selections || {};
        const serviceSelection = sessionData.service_selection || {};

        // Xử lý flights thành array
        const flights = [];
        if (flightsObj.outbound_flight_id) {
            flights.push({
                flightScheduleId: flightsObj.outbound_flight_id,
                type: 'outbound'
            });
        }
        if (flightsObj.return_flight_id) {
            flights.push({
                flightScheduleId: flightsObj.return_flight_id,
                type: 'return'
            });
        }

        // 2) Tạo Booking gốc
        const booking = await Booking.create({
            booking_code: "BK" + Date.now(),
            account_id: session.account_id, 
            contact_email: contactInfo.email,
            contact_phone: contactInfo.phone,
            booking_type: flights.length === 2 ? "round_trip" : "one_way",
            total_amount: amount,
            status: "confirmed",
            payment_status: "paid",
            confirmed_at: new Date()
        });

        // 3) Tạo Payment
        const payment = await Payment.create({
            booking_id: booking.id,
            amount: amount,
            payment_method: "VNPay",
            payment_status: "paid",
            transaction_id: transactionId,
            gateway_response: JSON.stringify(rawData),
            paid_at: new Date()
        });

        // 4) Tạo BookingFlight
        const bookingFlightRecords = [];
        for (const f of flights) {
            const record = await BookingFlight.create({
                booking_id: booking.id,
                flight_schedule_id: f.flightScheduleId,
                flight_type: f.type
            });
            bookingFlightRecords.push(record);
        }

        // 5) Tạo BookingPassenger
        const passengerRecords = [];
        for (const p of passengers) {
            const passenger = await BookingPassenger.create({
                booking_id: booking.id,
                fullname: p.fullname,
                gender: p.gender || null,
                date_of_birth: p.date_of_birth,
                passenger_type: p.passenger_type,
                nationality: p.nationality || null,
                passport_number: p.passport_number || null,
            });
            passengerRecords.push(passenger);
        }

        // 6) Tạo Ticket và update seat
        for (let i = 0; i < passengerRecords.length; i++) {
            const pax = passengerRecords[i];
            for (const f of bookingFlightRecords) {
                const seatSelection = seatSelections[f.flight_schedule_id];
                if (!seatSelection) continue;
                const passengerSeat = seatSelection.passenger_selections.find(
                    s => s.passenger_index === i
                );
                if (!passengerSeat) continue;
                const seatPricing = seatSelection.seat_pricing.seats.find(
                    s => s.passenger_index === i
                );
                const selectedSeat = await FlightSeat.findByPk(passengerSeat.flight_seat_id);

                // Mark seat as booked
                await selectedSeat.update({
                    status: "booked",
                    blocked_session_id: null,
                    blocked_until: null
                });

                // Create Ticket
                await Ticket.create({
                    ticket_number: "T" + Date.now() + "_" + pax.id,
                    booking_id: booking.id,
                    booking_flight_id: f.id,
                    booking_passenger_id: pax.id,
                    flight_seat_id: selectedSeat.id,
                    seat_number: seatPricing.seat_number,
                    seat_class_id: seatPricing.seat_class_id || null,
                    base_fare: seatPricing.base_price || 0,
                    seat_adjustment: seatPricing.seat_adjustment || 0,
                    tax: 0,
                    service_fee: 0,
                    total_amount: (seatPricing.base_price || 0) + (seatPricing.seat_adjustment || 0),
                    status: 'issued',
                    issued_at: new Date()
                });
            }
        }

        // 7) Xóa booking session
        await BookingSession.destroy({
            where: { id: bookingSessionId }
        });
        console.log("✅ 2 Booking confirmed with ID:", booking.id);

        return { bookingId: booking.id };
    }
}

module.exports = BookingService;