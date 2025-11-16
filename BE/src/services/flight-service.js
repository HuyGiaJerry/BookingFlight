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
            const { flight_number, departure_airport_id, arrival_airport_id, airline_id, duration_minutes, status } = data;
            if (!flight_number || !departure_airport_id || !arrival_airport_id || !airline_id) {
                throw new AppError('Missing required flight fields', StatusCodes.BAD_REQUEST);
            }
            const flight = await this.flightRepository.create({
                flight_number,
                airline_id,
                departure_airport_id,
                arrival_airport_id,
                duration_minutes,
                status
            });
            return flight;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Unable to create flight', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllFlights(page = 1, limit = 10) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        return this.flightRepository.getAllWithDetails(pageNum, limitNum);
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
        const passenger_count = Number(searchCriteria.passenger_count) || 1;
        const infant_count = Number(searchCriteria.infant_count) || 0;
        const page = Number(searchCriteria.page) || 1;
        const limit = Number(searchCriteria.limit) || 10;
        const sort_by = searchCriteria.sort_by || 'departure_time';
        const sort_order = (searchCriteria.sort_order || 'ASC').toUpperCase();

        if (!searchCriteria.from_airport_id || !searchCriteria.to_airport_id) {
            throw new AppError('Missing airport IDs', StatusCodes.BAD_REQUEST);
        }

        const searchParams = {
            from_airport_id: Number(searchCriteria.from_airport_id),
            to_airport_id: Number(searchCriteria.to_airport_id),
            departure_date: searchCriteria.departure_date,
            return_date: searchCriteria.return_date,
            passenger_count,
            infant_count,
            page,
            limit,
            sort_by,
            sort_order
        };

        if (searchCriteria.trip_type === 'one-way') {
            const result = await this.flightRepository.findAvailableFlightSchedules(searchParams);
            if (!result.data || result.data.length === 0)
                throw new AppError('No flights found', StatusCodes.NOT_FOUND);
            return this.formatOneWayResult(result, passenger_count);
        } else if (searchCriteria.trip_type === 'round-trip') {
            if (!searchCriteria.return_date)
                throw new AppError('Missing return_date', StatusCodes.BAD_REQUEST);

            const result = await this.flightRepository.findRoundTripFlightSchedules(searchParams);

            if ((!result.outbound.data || result.outbound.data.length === 0) ||
                (!result.inbound.data || result.inbound.data.length === 0)) {
                throw new AppError('No round-trip flights found', StatusCodes.NOT_FOUND);
            }

            return this.formatRoundTripResult(result, passenger_count);
        } else {
            throw new AppError('Invalid trip_type', StatusCodes.BAD_REQUEST);
        }
    } catch (error) {
        console.error('❌ Service error in searchFlights:', error);
        if (error instanceof AppError) throw error;
        throw new AppError('Unable to search flights', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

    /**
     * 🔹 FORMAT ONE-WAY RESULT
     */
    formatOneWayResult(result, passengerCount) {
        const flights = result.data.map(schedule => {
            const flight = schedule.flight;
            const fares = schedule.flightFares.map(fare => ({
                id: fare.id,
                class: fare.seatClass.class_code,
                price_total: (Number(fare.base_price) + Number(fare.tax || 0) + Number(fare.service_fee || 0)) * passengerCount,
                seats_available: fare.seats_available
            }));

            return {
                schedule_id: schedule.id,
                flight_number: flight.flight_number,
                departure_time: schedule.departure_time,
                arrival_time: schedule.arrival_time,
                duration_minutes: flight.duration_minutes,
                airplane_model: schedule.airplane.model,
                airline: schedule.airplane.airline.name,
                route: {
                    from: flight.departureAirport.name,
                    to: flight.arrivalAirport.name
                },
                fares
            };
        });

        return { flights, pagination: result.pagination };
    }

    /**
     * 🔹 FORMAT ROUND-TRIP RESULT
     */
    formatRoundTripResult(result, passengerCount) {
        return {
            outbound: this.formatOneWayResult(result.outbound, passengerCount),
            inbound: this.formatOneWayResult(result.inbound, passengerCount)
        };
    }

}

module.exports = FlightService;
