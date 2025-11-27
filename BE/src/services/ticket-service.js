const { StatusCodes } = require('http-status-codes');
const { TicketRepository, BookingRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');

class TicketService {
    constructor() {
        this.ticketRepository = new TicketRepository();
        this.bookingRepository = new BookingRepository();
    }

    async getTicketByNumber(ticketNumber) {
        try {
            const tickets = await this.ticketRepository.getAll({
                where: { ticket_number: ticketNumber }
            });

            if (tickets.length === 0) {
                throw new AppError('Ticket not found', StatusCodes.NOT_FOUND);
            }

            const ticket = await this.ticketRepository.getTicketDetails(tickets[0].id);
            return this.formatTicketDetails(ticket);
        } catch (error) {
            console.error('Error getting ticket by number:', error);
            throw error;
        }
    }

    async getBookingTickets(bookingId) {
        try {
            const tickets = await this.ticketRepository.getTicketsByBooking(bookingId);

            return {
                booking_id: bookingId,
                total_tickets: tickets.length,
                tickets: tickets
            };
        } catch (error) {
            console.error('Error getting booking tickets:', error);
            throw error;
        }
    }

    formatTicketDetails(ticket) {
        return {
            ticket_info: {
                ticket_number: ticket.ticket_number,
                status: ticket.status,
                issued_at: ticket.issued_at
            },
            passenger: {
                name: ticket.bookingPassenger?.fullname,
                type: ticket.bookingPassenger?.passenger_type
            },
            flight: {
                flight_number: ticket.bookingFlight?.flightSchedule?.flight?.flight_number,
                departure: ticket.bookingFlight?.flightSchedule?.flight?.departureAirport,
                arrival: ticket.bookingFlight?.flightSchedule?.flight?.arrivalAirport
            },
            seat: {
                number: ticket.seat_number,
                class: ticket.seatClass?.class_name
            }
        };
    }
}

module.exports = TicketService;