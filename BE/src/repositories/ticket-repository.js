const CrudRepository = require('./crud-repository');
const {Ticket,Passenger,Seat,FlightScheduleFare} = require('../models');

class TicketRepository extends CrudRepository {
    constructor() {
        super(Ticket);
    }

    async createTickets(ticketsData) {
        try {
            const tickets = await Promise.all(
                ticketsData.map(ticketData => this.create(ticketData))
            );
            return tickets;
        } catch (error) {
            throw error;
        }
    }

    async getTicketsByBookingId(bookingId) {
        try {
            const tickets = await Ticket.findAll({
                where: { booking_id: bookingId },
                include: [
                    { model: Passenger, as: 'passenger' },
                    { model: Seat, as: 'seat' },
                    { model: FlightScheduleFare, as: 'fare' }
                ]
            });
            return tickets;
        } catch (error) {
            throw error;
        }
    }

    async generateTicketCode() {
        try {
            const timestamp = Date.now().toString(); // Lấy timestamp hiện tại
            const random = Math.random().toString(36).substring(2, 8).toUpperCase();
            return `TK${timestamp}${random}`;
        } catch (error) {
            
        }
    }

    async updateTicketStatus(ticketId, status) {
        try {
            const result = await this.update(ticketId, { ticket_status: status });
            return result;
        } catch (error) {
            throw error;
        }
    }



}

module.exports = TicketRepository;