
class FlightTransformer {

    static transformSingleFlight(flight) {
        return {
            flight_id: flight.id,
            flight_number: flight.flight_number,
            duration: flight.duration,
            base_price: flight.base_price,
            flight_status: flight.flight_status,
            departure_airport: {
                id: flight.departureAirport?.id,
                name: flight.departureAirport?.name,
                iata_code: flight.departureAirport?.iata_code,
                city: flight.departureAirport?.city,
                country: flight.departureAirport?.country
            },
            arrival_airport: {
                id: flight.arrivalAirport?.id,
                name: flight.arrivalAirport?.name,
                iata_code: flight.arrivalAirport?.iata_code,
                city: flight.arrivalAirport?.city,
                country: flight.arrivalAirport?.country
            },
            airplane: {
                id: flight.airplane?.id,
                model: flight.airplane?.model,  
                seat_capacity: flight.airplane?.seat_capacity,
                airline: {
                    id: flight.airplane?.airline?.id,
                    name: flight.airplane?.airline?.name,
                    logo_url: flight.airplane?.airline?.logo_url,
                    code: flight.airplane?.airline?.code
                }
            }
        }
    }


    static transformFlightList(flightList) {
        return flightList.map(flight => this.transformSingleFlight(flight));
    }


    static transformFlightData(flights) {
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






}

module.exports = FlightTransformer;







