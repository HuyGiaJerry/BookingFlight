const FlightService = require('./flight-service');

class FlightSummaryService {
    constructor() {
        this.flightService = new FlightService();
    }

    async getSelectedFlightsSummary(flightScheduleIds) {
        try {
            const flights = await this.flightService.getFlightScheduleDetails(flightScheduleIds);

            return {
                flight_count: flights.length,
                flights: flights.map(flight => ({
                    schedule_id: flight.schedule_id,
                    flight_number: flight.flight_number,
                    airline: {
                        name: flight.airline.name,
                        code: flight.airline.code,
                        logo: flight.airline.logo
                    },
                    route: {
                        departure: {
                            airport: flight.departure.airport,
                            city: flight.departure.city,
                            iata: flight.departure.iata,
                            time: flight.departure.time
                        },
                        arrival: {
                            airport: flight.arrival.airport,
                            city: flight.arrival.city,
                            iata: flight.arrival.iata,
                            time: flight.arrival.time
                        }
                    },
                    duration_minutes: flight.duration_minutes,
                    aircraft: flight.airplane,
                    status: flight.status
                }))
            };
        } catch (error) {
            console.error('Error getting flight summary:', error);
            throw error;
        }
    }
}

module.exports = FlightSummaryService;