const CrudRepository = require('./crud-repository');
const {Ticket, Booking, BookingFlight, BookingPassenger, FlightSeat, SeatLayout, SeatClass, FlightSchedule, Flight, Airport } = require('../models');

class TicketRepository extends CrudRepository {
    constructor() {
        super(Ticket);
    }

    /**
     * Generate unique ticket number
     */
    async generateTicketNumber() {
        let ticketNumber;
        let exists = true;

        while (exists) {
            ticketNumber = 'TK' + Date.now().toString().slice(-8) +
                Math.random().toString(36).substr(2, 4).toUpperCase();

            const existing = await Ticket.findOne({
                where: { ticket_number: ticketNumber }
            });

            exists = !!existing;
        }

        return ticketNumber;
    }

    /**
     * Create tickets for booking
     */
    async createTicketsForBooking(bookingId, ticketData, transaction = null) {
        try {
            const tickets = await Promise.all(
                ticketData.map(async (data) => {
                    const ticketNumber = await this.generateTicketNumber();

                    return await Ticket.create({
                        ticket_number: ticketNumber,
                        booking_id: bookingId,
                        booking_flight_id: data.booking_flight_id,
                        booking_passenger_id: data.booking_passenger_id,
                        flight_seat_id: data.flight_seat_id,
                        seat_number: data.seat_number,
                        seat_class_id: data.seat_class_id,
                        base_fare: data.base_fare,
                        seat_adjustment: data.seat_adjustment || 0,
                        tax: data.tax || 0,
                        service_fee: data.service_fee || 0,
                        total_amount: data.total_amount,
                        status: 'issued',
                        issued_at: new Date()
                    }, { transaction });
                })
            );

            return tickets;
        } catch (error) {
            console.error('Error creating tickets for booking:', error);
            throw error;
        }
    }

    /**
     * Get ticket details with full information
     */
    async getTicketDetails(ticketId) {
        try {
            return await Ticket.findByPk(ticketId, {
                include: [
                    {
                        model: Booking,
                        as: 'booking',
                        attributes: ['id', 'booking_code', 'contact_email', 'contact_phone']
                    },
                    {
                        model: BookingFlight,
                        as: 'bookingFlight',
                        include: [
                            {
                                model: FlightSchedule,
                                as: 'flightSchedule',
                                include: [
                                    {
                                        model: Flight,
                                        as: 'flight',
                                        include: [
                                            {
                                                model: Airport,
                                                as: 'departureAirport',
                                                attributes: ['name', 'iata_code', 'city']
                                            },
                                            {
                                                model: Airport,
                                                as: 'arrivalAirport',
                                                attributes: ['name', 'iata_code', 'city']
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: BookingPassenger,
                        as: 'bookingPassenger'
                    },
                    {
                        model: FlightSeat,
                        as: 'flightSeat',
                        include: [
                            {
                                model: SeatLayout,
                                as: 'seatLayout'
                            }
                        ]
                    },
                    {
                        model: SeatClass,
                        as: 'seatClass'
                    }
                ]
            });
        } catch (error) {
            console.error('Error getting ticket details:', error);
            throw error;
        }
    }

    /**
     * Get tickets by booking ID
     */
    async getTicketsByBooking(bookingId) {
        try {
            return await Ticket.findAll({
                where: { booking_id: bookingId },
                include: [
                    {
                        model: BookingFlight,
                        as: 'bookingFlight',
                        attributes: ['flight_type']
                    },
                    {
                        model: BookingPassenger,
                        as: 'bookingPassenger',
                        attributes: ['fullname', 'passenger_type']
                    },
                    {
                        model: SeatClass,
                        as: 'seatClass',
                        attributes: ['class_name', 'class_code']
                    }
                ],
                order: [['booking_flight_id', 'ASC'], ['booking_passenger_id', 'ASC']]
            });
        } catch (error) {
            console.error('Error getting tickets by booking:', error);
            throw error;
        }
    }

    /**
     * Check-in passenger
     */
    async checkInPassenger(ticketId) {
        try {
            const [updatedRows] = await Ticket.update({
                checked_in_at: new Date()
            }, {
                where: {
                    id: ticketId,
                    status: 'issued'
                }
            });

            return updatedRows > 0;
        } catch (error) {
            console.error('Error checking in passenger:', error);
            throw error;
        }
    }

    /**
     * Cancel ticket
     */
    async cancelTicket(ticketId) {
        try {
            const [updatedRows] = await Ticket.update({
                status: 'cancelled',
                cancelled_at: new Date()
            }, {
                where: { id: ticketId }
            });

            return updatedRows > 0;
        } catch (error) {
            console.error('Error cancelling ticket:', error);
            throw error;
        }
    }
}

module.exports = TicketRepository;