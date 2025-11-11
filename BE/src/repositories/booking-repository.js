const CrudRepository = require('./crud-repository');
const { Booking, BookingFlightSchedule, Passenger, Ticket, BookingService, FlightSchedule, Flight, Airport, Airline, Airplane, Seat, FlightScheduleFare, Payment } = require('../models');
const { sequelize } = require('../models');
const booking = require('../models/booking');


class BookingRepository extends CrudRepository {
    constructor() {
        super(Booking);
    }

    async createBookingWithTransaction(bookingData){
        const t = await sequelize.transaction();
        try {
            const booking = await Booking.create(bookingData, { transaction: t });
            await t.commit();
            return booking;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }


    async getBookingWithDetails(bookingId) {
        try {
            const booking = await Booking.findByPk(bookingId, {
                include: [{
                    model: BookingFlightSchedule, as: 'bookingFlightSchedules',
                    include: [{
                        model: FlightSchedule, as: 'flightSchedule',
                        include: [{
                            model: Flight, as: 'flight',
                            include: [
                                {model:Airport , as: 'departureAirport'},
                                {model:Airport , as: 'arrivalAirport'},
                                {model:Airplane , as: 'airplane',
                                    include: [{model:Airline , as: 'airline'}]
                                },
                            ]
                        }]
                    }]
                },
                {
                    model: Ticket, as: 'tickets',
                    include: [
                        {model: Passenger, as: 'passenger'},
                        {model: Seat, as: 'seat'}
                    ]
                },
                {
                    model: BookingService, as: 'services'
                },
                {
                    model: Payment, as: 'payment'
                }
            
            ]
            });
            return booking;
        } catch (error) {
            throw error;
        }
    }


    async updateBookingStatus(bookingId, status) {
        try {
            const result = await this.update(bookingId,{booking_status: status});
            return result;
        } catch (error) {
            throw error;
        }
    }


}

module.exports = BookingRepository;