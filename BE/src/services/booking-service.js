const { StatusCodes } = require('http-status-codes');
const { BookingRepository, PassengerRepository, SeatRepository, ExtraServiceRepository, BookingServiceRepository, FlightScheduleRepository, TicketRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const { BookingFlightSchedule } = require('../models');
const { sequelize } = require('../models');

class BookingService {
    constructor() {
        this.bookingRepository = new BookingRepository();
        this.passengerRepository = new PassengerRepository();
        this.seatRepository = new SeatRepository();
        this.extraServiceRepository = new ExtraServiceRepository();
        this.bookingServiceRepository = new BookingServiceRepository();
        this.flightScheduleRepository = new FlightScheduleRepository();
        this.ticketRepository = new TicketRepository();
    }

    // Bước 1 : Tạo booking draft khi ng dùng chọn flight schedule 
    async initializeBooking(data) {
        try {
            const { user_id, flight_schedules, booking_type, passenger_count } = data;

            // Validate flight schedules
            for (const flightSchedule of flight_schedules) {
                const schedule = await this.flightScheduleRepository.get(flightSchedule.id);

                if (!schedule) throw new AppError(`Flight schedule ${flightSchedule.id} not found `, StatusCodes.NOT_FOUND);

                // check seat availability
                const isAvailable = await this.flightScheduleRepository.checkScheduleAvailability(flightSchedule.id, passenger_count);

                if (!isAvailable) throw new AppError(`No available seats for flight schedule ${flightSchedule.id}`, StatusCodes.BAD_REQUEST);
            }

            // Create booking draft
            const bookingDraft = await this.bookingRepository.create({
                user_id,
                total_price: 0,
                booking_status: 'draft',
                overall_status: 'active',
                booking_type,
            });

            // Create booking flight schedules

            const bookingFlightSchedules = await Promise.all(
                flight_schedules.map(fs =>
                    BookingFlightSchedule.create({
                        booking_id: bookingDraft.id,
                        flight_schedule_id: fs.id,
                        flight_type: fs.flight_type || 'outbound'
                    })
                )
            )
            return {
                booking_id: bookingDraft.id,
                booking_flight_schedules: bookingFlightSchedules
            }



        } catch (error) {
            console.error('Error initializing booking:', error);
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to initialize booking', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }


    // Bước 2 : Get flight details và seat layout cho passenger form 
    async getBookingDetails(bookingId) {
        try {
            const booking = await this.bookingRepository.getBookingWithDetails(bookingId);
            if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);

            const flightDetails = [];

            for (let bookingFlightSchedule of booking.bookingFlightSchedules) {
                const schedule = await this.flightScheduleRepository.getScheduleWithDetails(bookingFlightSchedule.flight_schedule_id);

                const seatLayout = await this.getSeatLayout(bookingFlightSchedule.flight_schedule_id);
                const availableServices = await this.extraServiceRepository.getAllAvailableServices();
                flightDetails.push({
                    flight_type: bookingFlightSchedule.flight_type,
                    schedule,
                    seat_layout: seatLayout,
                    available_services: availableServices
                });
            }

            return {
                booking,
                flight_details: flightDetails
            }

        } catch (error) {
            console.error('Error getting booking details:', error);
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to get booking details', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    // Bước 3: Get seat layout để hiển thị sơ đồ máy bay 
    async getSeatLayout(flightScheduleId) {
        try {
            console.log(`Fetching seat layout for flight schedule ID: ${flightScheduleId}`);

            const availableSeats = await this.seatRepository.getAvailableSeatsBySchedule(flightScheduleId);

            if (!availableSeats || availableSeats.length === 0) {
                console.log(`No available seats found for flight schedule ID: ${flightScheduleId}`);
                return [];
            }

            // Group seats by row và organize layout 
            const seatMap = {};
            availableSeats.forEach(seat => {
                const row = seat.seat_number.replace(/[A-Z]/g, ''); // Lấy số hàng
                const column = seat.seat_number.replace(/[0-9]/g, ''); // Lấy chữ cái cột

                if (!seatMap[row]) {
                    seatMap[row] = {};
                }
                seatMap[row][column] = {
                    seat_id: seat.id,
                    seat_type: seat.seat_type,
                    seat_position: seat.seat_position,
                    seat_number: seat.seat_number,
                    seat_status: seat.seat_status,
                    seat_override: seat.price_override || 0,
                    // Thêm layout info nếu có 
                    layout_info: seat.layoutSeat ? {
                        seat_position: seat.layoutSeat.seat_position,
                        layout_seat_type: seat.layoutSeat.seat_type
                    } : null
                };
            });

            // Convert to array format for fe display 
            const layout = Object.keys(seatMap).sort((a, b) => parseInt(a) - parseInt(b)).map(row => ({
                row: parseInt(row),
                seats: seatMap[row]
            }));
            console.log('Processed seat layout rows:', layout.length);

            return layout;

        }


        catch (error) {
            console.error('Error getting seat layout:', error);
            throw new AppError('Unable to get seat layout: ' + error.message, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    // Bước 4: Thêm passenger to booking
    async addPassengers(bookingId, passengersData) {
        const transaction = await sequelize.transaction();
        try {
            // Validate booking exists và status 
            const booking = await this.bookingRepository.get(bookingId);
            if (!booking) throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
            if (booking.booking_status !== 'draft') throw new AppError('Cannot modify confirmed booking', StatusCodes.BAD_REQUEST);

            // validate passenger data 
            const validatedPassengers = passengersData.map(p => {
                const { fullname, dob, passport_number, nationality, gender, passport_expiry, passenger_type } = p;

                if (!fullname || !dob || !passenger_type || !gender) throw new AppError('Missing required passenger information', StatusCodes.BAD_REQUEST);

                return {
                    fullname: fullname.trim(),
                    dob,
                    passenger_type,
                    passport_number,
                    nationality: nationality || 'VN',
                    gender,
                    passport_expiry
                }
            });

            // Create passengers
            const passengers = await Promise.all(
                validatedPassengers.map(passengerData => {
                    return this.passengerRepository.create(passengerData, { transaction })
                })
            )

            await transaction.commit();

            return {
                booking_id: bookingId,
                passengers: passengers
            }

        } catch (error) {
            await transaction.rollback();
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to add passengers', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    // Bước 5: Chọn ghế (seat) cho từng passenger trên từng flight schedule
    async selectSeats(bookingId, seatSelections) {
        const transaction = await sequelize.transaction();
        try {
            // seatSelections: [{passenger_id, flight_schedule_id, seat_id}]

            const booking = await this.bookingRepository.get(bookingId);
            if (!booking || booking.booking_status !== 'draft') throw new AppError('Invalid booking for seat selection', StatusCodes.BAD_REQUEST);

            // Extract seat availablity 
            const seatIds = seatSelections.map(selection => selection.seat_id);

            const isAvailable = await this.seatRepository.checkSeatsAvailability(seatIds);
            if (!isAvailable) throw new AppError('One or more selected seats are no longer available', StatusCodes.BAD_REQUEST);


            // Reserve seats
            const reservedCount = await this.seatRepository.reserveSeats(seatIds);
            if (reservedCount !== seatIds.length) throw new AppError('Failed to reserve all selected seats', StatusCodes.BAD_REQUEST);

            // Store seat selections trong db 
            await transaction.commit();

            return {
                booking_id: bookingId,
                selected_seats: seatSelections,
                message: 'Seats selected successfully'
            }



        } catch (error) {
            await transaction.rollback();
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to select seats', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }


    // Bước 6: Thêm extra services cho booking
    async addExtraServices(bookingId, servicesData) {
        const transaction = await sequelize.transaction();
        try {
            // servicesData: [{passenger_id, flight_schedule_id, service_id, quantity}]
            const booking = await this.bookingRepository.get(bookingId);
            if (!booking || booking.booking_status !== 'draft') throw new AppError('Invalid booking for adding services', StatusCodes.BAD_REQUEST);

            // Validate service exists
            const serviceIds = [...new Set(servicesData.map(s => s.service_id))];
            const services = await this.extraServiceRepository.getServicesByIds(serviceIds);
            if (services.length !== serviceIds.length) throw new AppError('One or more extra services are invalid', StatusCodes.BAD_REQUEST);

            // Create booking services
            const bookingServices = await Promise.all(
                servicesData.map(serviceData => {
                    this.bookingServiceRepository.create({
                        booking_id: bookingId,
                        ...serviceData
                    }, { transaction })
                })
            );

            await transaction.commit();

            return {
                booking_id: bookingId,
                services: bookingServices,
                message: 'Extra services added successfully'
            }

        } catch (error) {
            await transaction.rollback();
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to add extra services', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }


    // Bước 7: Tính tổng giá và xác nhận booking
    async confirmBooking(bookingId) {
        const transaction = await sequelize.transaction();

        try {
            const booking = await this.bookingRepository.get(bookingId);
            if (!booking || booking.booking_status !== 'draft') throw new AppError('Invalid booking for confirmation', StatusCodes.BAD_REQUEST);

            let totalPrice = 0;

            // Tính giá flight schedules
            for (let bookingFlightSchedule of booking.bookingFlightSchedules) {
                const schedule = await this.flightScheduleRepository.get(bookingFlightSchedule.flight_schedule_id);
                totalPrice += schedule.price * booking.tickets.length; // Assume tickets already created
            }

            // Tính giá extra services
            for (let service of booking.services) {
                const serviceDetail = await this.extraServiceRepository.get(service.service_id);
                totalPrice += serviceDetail.price * service.quantity;
            }

            // Tính giá seats price 
            for (let ticket of booking.tickets) {
                if (ticket.seat) {
                    totalPrice += ticket.seat.price_override || 0;
                }
            }

            // Cập nhật tổng giá và xác nhận booking
            await this.bookingRepository.update(bookingId, {
                total_price: totalPrice,
                booking_status: 'confirmed'
            }, { transaction });

            // Update flight schedule available seats
            for (let bookingFlightSchedule of booking.bookingFlightSchedules) {
                await this.flightScheduleRepository.updateAvailableSeats(
                    bookingFlightSchedule.flight_schedule_id,
                    -booking.tickets.length
                );
            }

            await transaction.commit();

            return {
                booking_id: bookingId,
                total_price: totalPrice,
                message: 'Booking confirmed successfully'
            }

        } catch (error) {
            await transaction.rollback();
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to confirm booking', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }


    // Bước 8: Tạo vé (tickets) sau khi booking confirmed
    async createTickets(bookingId, ticketData) {
        const transaction = await sequelize.transaction();
        try {
            // ticketData: [{passenger_id, flight_schedule_id, seat_id, fare_id}]
            const booking = await this.bookingRepository.get(bookingId);
            if (!booking || booking.booking_status !== 'confirmed') throw new AppError('Booking must be confirmed to create tickets', StatusCodes.BAD_REQUEST);

            const tickets = await Promise.all(
                ticketData.map(async (data) => {
                    const ticketCode = await this.ticketRepository.generateTicketCode();
                    return this.ticketRepository.create({
                        ticket_code: ticketCode,
                        booking_id: bookingId,
                        ticket_status: 'reserved',
                        ...data
                    }, { transaction });
                })
            );

            await transaction.commit();

            return {
                booking_id: bookingId,
                tickets: tickets,
                message: 'Tickets created successfully'
            };
        } catch (error) {
            await transaction.rollback();
            if (error instanceof AppError) throw error;
            throw new AppError('Failed to create tickets', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }


    // Get booking summary cho review page
    async getBookingSummary(bookingId) {
        try {
            const booking = await this.bookingRepository.getBookingWithDetails(bookingId);
            if (!booking) {
                throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
            }

            // Format detailed summary for review
            return {
                booking_info: {
                    id: booking.id,
                    status: booking.booking_status,
                    type: booking.booking_type,
                    total_price: booking.total_price
                },
                flights: booking.bookingFlightSchedules,
                passengers: booking.tickets?.map(ticket => ticket.passenger) || [],
                seats: booking.tickets?.map(ticket => ticket.seat) || [],
                services: booking.services,
                payment: booking.payment
            };

        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to get booking summary', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    // Cancel booking
    async cancelBooking(bookingId, reason) {
        const transaction = await sequelize.transaction();
        try {
            const booking = await this.bookingRepository.get(bookingId);
            if (!booking) {
                throw new AppError('Booking not found', StatusCodes.NOT_FOUND);
            }

            // Release seats back to available
            const tickets = await this.ticketRepository.getTicketsByBookingId(bookingId);
            const seatIds = tickets.map(ticket => ticket.seat_id).filter(id => id);

            if (seatIds.length > 0) {
                await this.seatRepository.update(seatIds, { seat_status: 'available' });
            }

            // Update booking status
            await this.bookingRepository.update(bookingId, {
                booking_status: 'cancelled',
                overall_status: 'refund'
            }, { transaction });

            await transaction.commit();

            return {
                booking_id: bookingId,
                message: 'Booking cancelled successfully'
            };

        } catch (error) {
            await transaction.rollback();
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to cancel booking', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }


}

module.exports = BookingService;