const { duration } = require("moment");

class FlightTransformer {

    static transformSingleFlight(flight) {
        return {
            flight_id: flight.id,
            flight_number: flight.flight_number,
            departure_airport: flight.departureAirport,
            arrival_airport: flight.arrivalAirport,
            airplane: flight.airplane,
            duration: flight.duration,
            base_price: flight.base_price,
            flight_status: flight.flight_status
        }
    }








}