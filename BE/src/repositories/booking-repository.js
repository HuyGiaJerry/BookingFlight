const CrudRepository = require('./crud-repository');
const { Booking, BookingFlight, BookingPassenger, FlightSchedule, Flight, Airport, Airline, Airplane, Account, Passenger, Ticket } = require('../models');
const { Op, Sequelize } = require('sequelize');

class BookingRepository extends CrudRepository {
    constructor() {
        super(Booking);
    }

    // Create new booking with flights 
    async createBookingWithFlights(bookingData, flightIds, transaction = null) {
        try {
            // Create the booking
            const booking = await Booking.create(bookingData, { transaction });

            // Add flight schedule to the booking flight
            const bookingFlights = await Promise.all(
                flightIds.map(async (flightData, index) => {
                    return await BookingFlight.create({
                        booking_id: booking.id,
                        flight_schedule_id: flightData.flight_schedule_id,
                        flight_type: flightData.flight_type || (index === 0 ? 'outbound' : 'inbound'),
                    }, { transaction });
                })
            )

            return { booking, bookingFlights };
        } catch (error) {
            console.log("Something went wrong in the Booking Repository: createBookingWithFlights", error);
            throw error;
        }

    }

    // Add passengers to booking
    async addPassengersToBooking(bookingId, passengers, transaction = null) {
        try {
            const bookingPassengers = await Promise.all(
                passengers.map(passenger => {
                    BookingPassenger.create({
                        booking_id: bookingId,
                        passenger_id: passenger.id || null,
                        fullname: passenger.fullname,
                        gender: passenger.gender,
                        date_of_birth: passenger.date_of_birth,
                        nationality: passenger.nationality,
                        passenger_type: passenger.passenger_type,
                        passport_number: passenger.passport_number,
                        passport_expiry: passenger.passport_expiry,
                        id_card_number: passenger.id_card_number,
                    }, { transaction });
                })
            )

            return bookingPassengers;
        } catch (error) {
            console.log("Something went wrong in the Booking Repository: addPassengersToBooking", error);
            throw error;
        }
    }

    // Generate booking code
    async generateBookingCode() {
        let bookingCode;
        let exists = true;
        while (exists) {
            bookingCode = 'BK' + Date.now().toString().slice(-8) +
                Math.random().toString(36).substr(2, 4).toUpperCase();

            const existing = await Booking.findOne({
                where: { booking_code: bookingCode }
            });

            exists = !!existing;
        }
        return bookingCode;
    }

    // Get booking with full details
    async getBookingDetails(bookingId) {
        try {
            return await Booking.findByPk(bookingId, {
                include: [
                    {
                        model: Account,
                        as: 'account',
                        attributes: ['email', 'fullname', 'phone']
                    },
                    {
                        model: BookingFlight,
                        as: 'bookingFlights',
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
                                            },
                                            {
                                                model: Airline,
                                                as: 'airline',
                                                attributes: ['name', 'iata_code', 'logo_url']
                                            }
                                        ]
                                    },
                                    {
                                        model: Airplane,
                                        as: 'airplane',
                                        attributes: ['model', 'registration_number']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: BookingPassenger,
                        as: 'bookingPassengers',
                    },
                    {
                        model: Ticket,
                        as: 'tickets',
                        include: [
                            {
                                model: BookingFlight,
                                as: 'bookingFlight',
                            },
                            {
                                model: BookingPassenger,
                                as: 'bookingPassenger',
                            }
                        ]
                    }
                ]
            })
        } catch (error) {
            console.error('Error fetching booking details:', error);
            throw error;
        }
    }

    //Get booking by booking code
    async getBookingByCode(bookingCode) {
        try {
            return await this.getBookingDetails(null, {
                where: { booking_code: bookingCode }
            });
        } catch (error) {
            console.log('Error getting booking by code:', error);
            throw error;
        }
    }

    // Update booking status
    async updateBookingStatus(bookingId, status, paymentStatus = null) {
        try {
            const updateData = { status };
            if (paymentStatus) {
                updateData.payment_status = paymentStatus;
            }
            if (status === 'confirmed')
                updateData.confirmed_at = new Date();

            return await this.update(bookingId, updateData);
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }
    }

    // Get user bookings with pagination
    async getUserBookings(accountId, page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;

            const { count, rows } = await Booking.findAndCountAll({
                where: { account_id: accountId },
                include: [
                    {
                        model: BookingFlight,
                        as: 'bookingFlights',
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
                                                attributes: ['name', 'iata_code']
                                            },
                                            {
                                                model: Airport,
                                                as: 'arrivalAirport',
                                                attributes: ['name', 'iata_code']
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ],
                order: [['created_at', 'DESC']],
                limit,
                offset
            });

            return {
                bookings: rows,
                pagination: {
                    totalPages: Math.ceil(count / limit),
                    currentPage: page,
                    limit,
                    totalCount: count
                }
            };
        } catch (error) {
            console.error('Error getting user bookings:', error);
            throw error;
        }
    }

    async createCompleteBooking(bookingData, flightData, passengerData, transaction = null) {
        try {
            // 1. Create booking
            const booking = await Booking.create(bookingData, { transaction });

            // 2. Create booking flights
            const bookingFlights = await Promise.all(
                flightData.map(async (flight, index) => {
                    return await BookingFlight.create({
                        booking_id: booking.id,
                        flight_schedule_id: flight.flight_schedule_id,
                        flight_type: flight.flight_type || (index === 0 ? 'outbound' : 'inbound'),
                    }, { transaction });
                })
            );

            // 3. Create booking passengers
            const bookingPassengers = await Promise.all(
                passengerData.map(async (passenger) => {
                    return await BookingPassenger.create({
                        booking_id: booking.id,
                        passenger_id: passenger.id || null,
                        fullname: passenger.fullname,
                        gender: passenger.gender,
                        date_of_birth: passenger.date_of_birth,
                        nationality: passenger.nationality,
                        passenger_type: passenger.passenger_type,
                        passport_number: passenger.passport_number,
                        passport_expiry: passenger.passport_expiry,
                        id_card_number: passenger.id_card_number,
                    }, { transaction });
                })
            );

            return {
                booking,
                bookingFlights,
                bookingPassengers
            };
        } catch (error) {
            console.error('Error creating complete booking:', error);
            throw error;
        }
    }


}

module.exports = BookingRepository;