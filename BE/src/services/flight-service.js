const { StatusCodes } = require('http-status-codes');
const { FlightRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const { FlightTransformer } = require('../transformers');
const moment = require('moment');

class FlightService {
    constructor() {
        this.flightRepository = new FlightRepository();
    }

    async createFlight(data) {
        try {
            const { flight_number, departure_airport_id, arrival_airport_id, airplane_id, duration, base_price, flight_status } = data;
            if (!flight_number || !departure_airport_id || !arrival_airport_id || !airplane_id) {
                throw new AppError('Missing required flight fields', StatusCodes.BAD_REQUEST);
            }
            const flight = await this.flightRepository.create({
                flight_number,
                departure_airport_id,
                arrival_airport_id,
                airplane_id,
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
        return this.flightRepository.getAllWithDetails();
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

    async searchFlights(searchCriteria) {
        try {
            const {
                trip_type,
                from_airport_id,
                to_airport_id,
                departure_date,
                return_date,
                class_type,
                passenger_count = 1,
                infant_count = 0,
                page = 1,
                limit = 10
            } = searchCriteria;

            const validTripTypes = ['one-way', 'round-trip'];
            if (!trip_type || !validTripTypes.includes(trip_type)) {
                throw new AppError('Invalid trip_type. Valid values are: one-way, round-trip', StatusCodes.BAD_REQUEST);
            }

            if (!from_airport_id || !to_airport_id || !departure_date) {
                throw new AppError('Missing required fields: from_airport_id, to_airport_id, departure_date', StatusCodes.BAD_REQUEST);
            }

            if (infant_count > passenger_count) {
                throw new AppError('Number of infants cannot exceed number of adults', StatusCodes.BAD_REQUEST);
            }

            const departureMoment = moment(departure_date, 'YYYY-MM-DD', true);
            if (!departureMoment.isValid()) {
                throw new AppError('Invalid departure_date format. Use YYYY-MM-DD', StatusCodes.BAD_REQUEST);
            }

            let result;
            switch (trip_type) {
                case 'one-way':
                    result = await this.searchOneWayFlights({
                        from_airport_id,
                        to_airport_id,
                        departure_date,
                        class_type,
                        passenger_count,
                        infant_count,
                        page,
                        limit
                    });
                    break;

                case 'round-trip':
                    if (!return_date) {
                        throw new AppError('Missing required field: return_date for round-trip', StatusCodes.BAD_REQUEST);
                    }

                    const returnMoment = moment(return_date, 'YYYY-MM-DD', true);
                    if (!returnMoment.isValid()) {
                        throw new AppError('Invalid return_date format. Use YYYY-MM-DD', StatusCodes.BAD_REQUEST);
                    }

                    if (returnMoment.isBefore(departureMoment)) {
                        throw new AppError('Return date must be after departure date', StatusCodes.BAD_REQUEST);
                    }

                    result = await this.searchRoundTripFlights({
                        from_airport_id,
                        to_airport_id,
                        departure_date,
                        return_date,
                        class_type,
                        passenger_count,
                        infant_count,
                        page,
                        limit
                    });
                    break;

                default:
                    throw new AppError('Unsupported trip type', StatusCodes.BAD_REQUEST);
            }

            return {
                success: true,
                trip_type,
                search_criteria: searchCriteria,
                results: result
            };

        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to search flights', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async searchOneWayFlights(criteria) {
        const { from_airport_id, to_airport_id, departure_date, class_type, passenger_count = 1, infant_count = 0, page = 1, limit = 10 } = criteria;

        // Chỉ tính ghế cho người lớn, trẻ em dưới 2 tuổi không tính
        const requiredSeats = passenger_count;

        const flights = await this.flightRepository.findAvailableFlights({
            from_airport_id,
            to_airport_id,
            departure_date,
            seat_class: class_type,
            passenger_count: requiredSeats,
            page,
            limit
        });

        if (!flights || flights.length === 0) {
            throw new AppError('No flights found for the given criteria', StatusCodes.NOT_FOUND);
        }

        return FlightTransformer.transformFlightData(flights);
    }

    async searchRoundTripFlights(criteria) {
        const { from_airport_id, to_airport_id, departure_date, return_date, class_type, passenger_count = 1, infant_count = 0, page = 1, limit = 10 } = criteria;

        const requiredSeats = passenger_count;

        const flights = await this.flightRepository.findRoundTripFlights({
            from_airport_id,
            to_airport_id,
            departure_date,
            return_date,
            seat_class: class_type,
            passenger_count: requiredSeats,
            page,
            limit
        });

        // Nếu 1 trong 2 chiều không có chuyến → báo lỗi
        if ((!flights.outbound || flights.outbound.length === 0) ||
            (!flights.inbound || flights.inbound.length === 0)) {
            throw new AppError('No round-trip flights found for the given criteria', StatusCodes.NOT_FOUND);
        }

        return {
            outbound: FlightTransformer.transformFlightData(flights.outbound),
            inbound: FlightTransformer.transformFlightData(flights.inbound)
            // combined: flights.combined
        };
    }
}

module.exports = FlightService;