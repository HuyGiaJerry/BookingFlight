const { StatusCodes } = require('http-status-codes');
const { FlightRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const moment = require('moment');
const { 
    FlightSchedule, 
    Flight, 
    Airport, 
    Airline, 
    Airplane 
} = require('../models');
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
<<<<<<< HEAD
            const passenger_count = Number(searchCriteria.passenger_count) || 1;
=======
            // ✅ UPDATED: Use adult_count instead of passenger_count
            const adult_count = Number(searchCriteria.adult_count) || 1;      // ✅ Changed from passenger_count
            const child_count = Number(searchCriteria.child_count) || 0;
>>>>>>> aac3e3aa5b51aa7a0858834e9213a0f82d645342
            const infant_count = Number(searchCriteria.infant_count) || 0;
            const page = Number(searchCriteria.page) || 1;
            const limit = Number(searchCriteria.limit) || 10;
            const sort_by = searchCriteria.sort_by || 'departure_time';
            const sort_order = (searchCriteria.sort_order || 'ASC').toUpperCase();

<<<<<<< HEAD
            if (!searchCriteria.from_airport_id || !searchCriteria.to_airport_id) {
                throw new AppError('Missing airport IDs', StatusCodes.BAD_REQUEST);
            }

=======
            // ✅ PASSENGER VALIDATION  
            const total_passengers = adult_count + child_count + infant_count;

            if (total_passengers > 7) {
                throw new AppError('Cannot book more than 7 passengers at a time', StatusCodes.BAD_REQUEST);
            }
            if (adult_count < 1) {                                         // ✅ Changed from passenger_count
                throw new AppError('At least one adult passenger is required', StatusCodes.BAD_REQUEST);
            }
            if (infant_count > adult_count) {                              // ✅ Changed from passenger_count
                throw new AppError('Number of infants cannot exceed number of adult passengers', StatusCodes.BAD_REQUEST);
            }

            console.log('👥 Passenger validation passed:', {
                adults: adult_count,                                       // ✅ Changed from passenger_count
                children: child_count,
                infants: infant_count,
                total: total_passengers
            });

            if (!searchCriteria.from_airport_id || !searchCriteria.to_airport_id) {
                throw new AppError('Missing airport IDs', StatusCodes.BAD_REQUEST);
            }

            // ✅ Validate dates
            if (!searchCriteria.departure_date || searchCriteria.departure_date === null) {
                throw new AppError('Invalid departure date format', StatusCodes.BAD_REQUEST);
            }

            if (searchCriteria.trip_type === 'round-trip' &&
                (!searchCriteria.return_date || searchCriteria.return_date === null)) {
                throw new AppError('Invalid return date format for round-trip', StatusCodes.BAD_REQUEST);
            }

>>>>>>> aac3e3aa5b51aa7a0858834e9213a0f82d645342
            const searchParams = {
                from_airport_id: Number(searchCriteria.from_airport_id),
                to_airport_id: Number(searchCriteria.to_airport_id),
                departure_date: searchCriteria.departure_date,
                return_date: searchCriteria.return_date,
<<<<<<< HEAD
                passenger_count,
                infant_count,
                page,
                limit,
                sort_by,
                sort_order,
                // New Filters
                airline_ids: searchCriteria.airline_ids,
                min_departure_time: searchCriteria.min_departure_time,
                max_departure_time: searchCriteria.max_departure_time,
                min_arrival_time: searchCriteria.min_arrival_time,
                max_arrival_time: searchCriteria.max_arrival_time,
                return_filters: searchCriteria.return_filters,
                seat_class: searchCriteria.preferred_class, // ✅ Pass seat class filter
                // ✅ NEW: Price Range & Time Slot Filters
                min_price: searchCriteria.min_price ? Number(searchCriteria.min_price) : undefined,
                max_price: searchCriteria.max_price ? Number(searchCriteria.max_price) : undefined,
                time_slot: searchCriteria.time_slot // e.g., 'morning', 'afternoon'
            };

=======
                adult_count,                                               // ✅ Changed from passenger_count
                child_count,
                infant_count,
                total_passengers,
                page,
                limit,
                sort_by,
                sort_order
            };

            console.log('🔍 Final search params:', searchParams);

>>>>>>> aac3e3aa5b51aa7a0858834e9213a0f82d645342
            if (searchCriteria.trip_type === 'one-way') {
                const result = await this.flightRepository.findAvailableFlightSchedules(searchParams);
                if (!result.data || result.data.length === 0)
                    throw new AppError('No flights found', StatusCodes.NOT_FOUND);
<<<<<<< HEAD
                return this.formatOneWayResult(result, passenger_count);
            } else if (searchCriteria.trip_type === 'round-trip') {
                if (!searchCriteria.return_date)
                    throw new AppError('Missing return_date', StatusCodes.BAD_REQUEST);

=======
                return this.formatOneWayResult(result, total_passengers, { adult_count, child_count, infant_count }); // ✅ Updated
            } else if (searchCriteria.trip_type === 'round-trip') {
>>>>>>> aac3e3aa5b51aa7a0858834e9213a0f82d645342
                const result = await this.flightRepository.findRoundTripFlightSchedules(searchParams);

                if ((!result.outbound.data || result.outbound.data.length === 0) ||
                    (!result.inbound.data || result.inbound.data.length === 0)) {
                    throw new AppError('No round-trip flights found', StatusCodes.NOT_FOUND);
                }

<<<<<<< HEAD
                return this.formatRoundTripResult(result, passenger_count);
=======
                return this.formatRoundTripResult(result, total_passengers, { adult_count, child_count, infant_count }); // ✅ Updated
>>>>>>> aac3e3aa5b51aa7a0858834e9213a0f82d645342
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
     * 🔹 FORMAT ONE-WAY RESULT with passenger breakdown
     */
    formatOneWayResult(result, totalPassengers, passengerBreakdown) {
        const flights = result.data.map(schedule => {
            const flight = schedule.flight;
            const fares = schedule.flightFares.map(fare => {

                // ✅ Calculate price with passenger type breakdown
                const adultPrice = Number(fare.base_price) + Number(fare.tax || 0) + Number(fare.service_fee || 0);
                const childPrice = adultPrice * 0.75;  // 25% discount for children
                const infantPrice = adultPrice * 0.1;  // 90% discount for infants (tax only)

                const totalPrice =
                    (adultPrice * passengerBreakdown.adult_count) +       // ✅ Changed from passenger_count
                    (childPrice * passengerBreakdown.child_count) +
                    (infantPrice * passengerBreakdown.infant_count);

                return {
                    id: fare.id,
                    class: fare.seatClass.class_code,
                    price_breakdown: {
                        adult_price: adultPrice,
                        child_price: childPrice,
                        infant_price: infantPrice,
                        total_price: totalPrice
                    },
                    passengers: {
                        adults: passengerBreakdown.adult_count,           // ✅ Changed from passenger_count
                        children: passengerBreakdown.child_count,
                        infants: passengerBreakdown.infant_count,
                        total: totalPassengers
                    },
                    seats_available: fare.seats_available
                };
            });

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

        return {
            flights,
            pagination: result.pagination,
<<<<<<< HEAD
            filter_options: result.filter_options // Pass through filter options if present
=======
            search_criteria: {
                passengers: {
                    adults: passengerBreakdown.adult_count,               // ✅ Changed from passenger_count
                    children: passengerBreakdown.child_count,
                    infants: passengerBreakdown.infant_count,
                    total: totalPassengers
                }
            }
>>>>>>> aac3e3aa5b51aa7a0858834e9213a0f82d645342
        };
    }

    /**
     * 🔹 FORMAT ROUND-TRIP RESULT
     */
    formatRoundTripResult(result, totalPassengers, passengerBreakdown) {
        return {
<<<<<<< HEAD
            outbound: this.formatOneWayResult(result.outbound, passengerCount),
            inbound: this.formatOneWayResult(result.inbound, passengerCount),
            filter_options: {
                outbound: result.outbound.filter_options,
                inbound: result.inbound.filter_options
            }
=======
            outbound: this.formatOneWayResult(result.outbound, totalPassengers, passengerBreakdown),
            inbound: this.formatOneWayResult(result.inbound, totalPassengers, passengerBreakdown)
>>>>>>> aac3e3aa5b51aa7a0858834e9213a0f82d645342
        };
    }

    /**
     * Get flight details for booking summary sidebar
     */
    async getFlightScheduleDetails(scheduleIds) {
        try {
            const flights = await FlightSchedule.findAll({
                where: { id: scheduleIds },
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
            });

            return flights.map(schedule => ({
                schedule_id: schedule.id,
                flight_number: schedule.flight.flight_number,
                airline: {
                    name: schedule.flight.airline.name,
                    code: schedule.flight.airline.iata_code,
                    logo: schedule.flight.airline.logo_url
                },
                departure: {
                    airport: schedule.flight.departureAirport.name,
                    city: schedule.flight.departureAirport.city,
                    iata: schedule.flight.departureAirport.iata_code,
                    time: schedule.departure_time
                },
                arrival: {
                    airport: schedule.flight.arrivalAirport.name,
                    city: schedule.flight.arrivalAirport.city,
                    iata: schedule.flight.arrivalAirport.iata_code,
                    time: schedule.arrival_time
                },
                duration_minutes: schedule.flight.duration_minutes,
                airplane: schedule.airplane.model,
                status: schedule.status
            }));
        } catch (error) {
            console.error('Error getting flight schedule details:', error);
            throw error;
        }
    }

    /**
     * Get fare information for flights
     */
    async getFlightFares(scheduleIds, seatClassIds = null) {
        // TODO: Implement fare retrieval from FlightFare table
        // This will be used to show pricing in sidebar
        return scheduleIds.map(id => ({
            schedule_id: id,
            base_fare: 1000000,
            currency: 'VND'
        }));
    } 

}

module.exports = FlightService;
