const { StatusCodes } = require('http-status-codes');
const { FlightRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const moment = require('moment');

class FlightService {
    constructor() {
        this.flightRepository = new FlightRepository();
    }

    async createFlight(data) {
        try {
            const { flight_number, departure_airport_id, arrival_airport_id, airplane_id, duration, base_price, flight_status } = data; // Sửa từ airline_id thành airplane_id
            if (!flight_number || !departure_airport_id || !arrival_airport_id || !airplane_id) {
                throw new AppError('Missing required flight fields', StatusCodes.BAD_REQUEST);
            }
            const flight = await this.flightRepository.create({
                flight_number,
                departure_airport_id,
                arrival_airport_id,
                airplane_id, // Sửa từ airline_id thành airplane_id
                duration,
                base_price,
                flight_status
            });
            return flight;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to create flight', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllFlights() {
        return this.flightRepository.getAll();
    }

    async getFlightById(flightId) {
        const flight = await this.flightRepository.getFlightByIdWithDetails(flightId);
        if (!flight) throw new AppError('Flight not found', StatusCodes.NOT_FOUND);
        return flight;
    }

    async updateFlight(flightId, flightData) {
        try {
            const updated = await this.flightRepository.update(flightId, flightData);
            if (!updated) throw new AppError('Flight not found', StatusCodes.NOT_FOUND);
            return updated;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to update flight', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteFlight(flightId) {
        const deleted = await this.flightRepository.destroy(flightId);
        if (!deleted) throw new AppError('Flight not found', StatusCodes.NOT_FOUND);
        return deleted;
    }

    transformFlightData(flights) {
        return flights.map(flight => ({
            flight_id: flight.id,
            flight_number: flight.flight_number,
            duration: flight.duration,
            base_price: flight.base_price,
            flight_status: flight.flight_status,
            airplane: flight.airplane,
            departure_airport: flight.departureAirport,
            arrival_airport: flight.arrivalAirport,
            schedules: flight.schedules.map(schedule => ({
                schedule_id: schedule.id,
                departure_time: schedule.departure_time,
                arrival_time: schedule.arrival_time,
                price: schedule.price,
                available_seat: schedule.available_seat,
                flight_schedule_status: schedule.flight_schedule_status,
                fares: schedule.dataValues?.fares || schedule.fares || [] // Lấy fares từ dataValues hoặc fares
            }))
        }));
    }

    async searchFlights(searchCriteria) {
        try {
            const {
                trip_type,
                from_airport_id,
                to_airport_id,
                departure_date,
                return_date,
                class_type
            } = searchCriteria;

            console.log('🚀 Service - Search criteria:', searchCriteria);

            // Validate trip_type
            const validTripTypes = ['one-way', 'round-trip'];
            if (!trip_type || !validTripTypes.includes(trip_type)) {
                throw new AppError('Invalid trip_type. Valid values are: one-way, round-trip', StatusCodes.BAD_REQUEST);
            }

            let result;

            switch (trip_type) {
                case 'one-way':
                    result = await this.searchOneWayFlights({
                        from_airport_id,
                        to_airport_id,
                        departure_date,
                        class_type
                    });
                    break;

                case 'round-trip':
                    result = await this.searchRoundTripFlights({
                        from_airport_id,
                        to_airport_id,
                        departure_date,
                        return_date,
                        class_type
                    });
                    break;

                default:
                    throw new AppError('Unsupported trip type', StatusCodes.BAD_REQUEST);
            }

            return {
                trip_type,
                search_criteria: searchCriteria,
                results: result
            };

        } catch (error) {
            console.error('❌ Service error:', error);
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to search flights', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async searchOneWayFlights(criteria) {
        const { from_airport_id, to_airport_id, departure_date, class_type } = criteria;

        console.log('🔍 Service - One way search:', criteria);

        // Validate required fields
        if (!from_airport_id || !to_airport_id || !departure_date) {
            throw new AppError('Missing required fields for one-way trip: from_airport_id, to_airport_id, departure_date', StatusCodes.BAD_REQUEST);
        }

        // Validate date format
        const formattedDate = moment(departure_date, 'YYYY-MM-DD', true);
        if (!formattedDate.isValid()) {
            throw new AppError('Invalid departure_date format. Please use YYYY-MM-DD', StatusCodes.BAD_REQUEST);
        }

        const flights = await this.flightRepository.findAvailableFlights(
            from_airport_id,
            to_airport_id,
            formattedDate.format('YYYY-MM-DD'),
            class_type
        );

        console.log('✈️ Service - Found flights:', flights.length);

        if (!flights || flights.length === 0) {
            throw new AppError('No flights found for the given criteria', StatusCodes.NOT_FOUND);
        }

        return this.transformFlightData(flights);
    }

    async searchRoundTripFlights(criteria) {
        const { from_airport_id, to_airport_id, departure_date, return_date, class_type } = criteria;

        console.log('🔄 Service - Round trip search:', criteria);

        // Validate required fields
        if (!from_airport_id || !to_airport_id || !departure_date || !return_date) {
            throw new AppError('Missing required fields for round-trip: from_airport_id, to_airport_id, departure_date, return_date', StatusCodes.BAD_REQUEST);
        }

        // Validate date formats
        const formattedDepartureDate = moment(departure_date, 'YYYY-MM-DD', true);
        const formattedReturnDate = moment(return_date, 'YYYY-MM-DD', true);

        if (!formattedDepartureDate.isValid() || !formattedReturnDate.isValid()) {
            throw new AppError('Invalid date format. Please use YYYY-MM-DD', StatusCodes.BAD_REQUEST);
        }

        // Validate return date is after departure date
        if (formattedReturnDate.isBefore(formattedDepartureDate)) {
            throw new AppError('Return date must be after departure date', StatusCodes.BAD_REQUEST);
        }

        const flights = await this.flightRepository.findRoundTripFlights(
            from_airport_id,
            to_airport_id,
            formattedDepartureDate.format('YYYY-MM-DD'),
            formattedReturnDate.format('YYYY-MM-DD'),
            class_type
        );

        if ((!flights.outbound || flights.outbound.length === 0) &&
            (!flights.inbound || flights.inbound.length === 0)) {
            throw new AppError('No flights found for the given criteria', StatusCodes.NOT_FOUND);
        }

        return {
            outbound: flights.outbound.length > 0 ? this.transformFlightData(flights.outbound) : [],
            inbound: flights.inbound.length > 0 ? this.transformFlightData(flights.inbound) : []
        };
    }
}

module.exports = FlightService;