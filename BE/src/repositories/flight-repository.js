const CrudRepository = require('./crud-repository');
const { Flight, FlightSchedule, Airport, FlightScheduleFare, Airline, Airplane, Seat } = require('../models');
const { Op } = require('sequelize');

class FlightRepository extends CrudRepository {
    constructor() {
        super(Flight);
    }
    async getFlightByIdWithDetails(flightId) {
        try {
            const flight = await Flight.findByPk(flightId, {
                include: [
                    {
                        model: Airport,
                        as: 'departureAirport',
                        attributes: ['id', 'iata_code', 'name', 'city', 'country']
                    },
                    {
                        model: Airport,
                        as: 'arrivalAirport',
                        attributes: ['id', 'iata_code', 'name', 'city', 'country']
                    },
                    {
                        model: Airplane,
                        as: 'airplane',
                        attributes: ['id', 'model', 'seat_capacity'],
                        include: [
                            {
                                model: Airline,
                                as: 'airline',
                                attributes: ['id', 'name', 'logo_url', 'code']
                            }
                        ]
                    }
                ]
            });
            return flight;
        } catch (error) {
            throw error;
        }
    }
    async getAllWithDetails(){
        try {
            const flights = await Flight.findAll({
                include: [
                    {
                        model: Airport,
                        as: 'departureAirport',
                        attributes: ['id', 'iata_code', 'name', 'city', 'country']
                    },
                    {
                        model: Airport,
                        as: 'arrivalAirport',
                        attributes: ['id', 'iata_code', 'name', 'city', 'country']
                    },
                    {
                        model: Airplane,
                        as: 'airplane',
                        attributes: ['id', 'model', 'seat_capacity'],
                        include: [
                            {
                                model: Airline,
                                as: 'airline',
                                attributes: ['id', 'name', 'logo_url', 'code']
                            }
                        ]
                    }
                ]
            });
            return flights;
        } catch (error) {
            console.error(' Error fetching flights:', error);
            throw error;
        }
    }

    // Tìm chuyến bay 1 chiều (one-way) 
    async findAvailableFlights({ from_airport_id, to_airport_id, departure_date, seat_class, passenger_count, infant_count = 0, page = 1, limit = 10 }) {
        try {
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;
            const offset = (pageNum - 1) * limitNum;

            const adultCount = Number(passenger_count);
            const infants = Number(infant_count);

            if (infants > adultCount) {
                throw new Error('Number of infants cannot exceed number of adults');
            }

            const seatsNeeded = adultCount; // Trẻ em <2 tuổi không tính ghế

            const flights = await Flight.findAll({
                where: {departure_airport_id: from_airport_id,arrival_airport_id: to_airport_id},
                attributes: ['id', 'flight_number', 'duration', 'base_price', 'flight_status', 'airplane_id', 'departure_airport_id', 'arrival_airport_id'],
                include: [
                    {
                        model: FlightSchedule,
                        as: 'schedules',
                        where: {
                            departure_time: {
                                [Op.between]: [
                                    new Date(`${departure_date} 00:00:00`),
                                    new Date(`${departure_date} 23:59:59`)
                                ]
                            },
                            flight_schedule_status: 'active' // chỉ lấy active
                        },
                        attributes: ['id', 'departure_time', 'arrival_time', 'price', 'flight_schedule_status'],
                        include: [
                            {
                                model: Seat,
                                as: 'seats',
                                where: { seat_status: 'available' },
                                attributes: ['id', 'seat_status', 'layout_seat_id', 'price_override', 'flight_schedule_id'],
                                required: false
                            },
                            {
                                model: FlightScheduleFare,
                                as: 'fares',
                                attributes: ['id', 'class_type', 'price', 'seat_allocated', 'flight_schedule_id'],
                                where: seat_class ? { class_type: seat_class } : {},
                                required: false
                            }
                        ]
                    },
                    { 
                        model: Airplane, 
                        as: 'airplane', 
                        attributes: ['id', 'model', 'seat_capacity', 'airline_id'],
                        include: [{ model: Airline, as: 'airline', attributes: ['id', 'name', 'logo_url', 'code'] }] 
                    },
                    { model: Airport, as: 'departureAirport', attributes: ['id', 'name', 'iata_code', 'city', 'country'] },
                    { model: Airport, as: 'arrivalAirport', attributes: ['id', 'name', 'iata_code', 'city', 'country']  }
                ],
                offset,
                limit: limitNum
            });

            // Filter schedules đủ ghế cho adultCount
            const filteredFlights = flights.map(flight => {
                flight.schedules = flight.schedules.filter(schedule => {
                    const availableSeats = schedule.seats.filter(s => s.seat_status === 'available').length;
                    schedule.dataValues.available_seat = availableSeats;

                    console.log(`Flight ${flight.flight_number}, Schedule ${schedule.id}, availableSeats=${availableSeats}, seatsNeeded=${seatsNeeded}`);

                    return availableSeats >= seatsNeeded;
                });
                return flight;
            }).filter(f => f.schedules.length > 0);

            return filteredFlights;

        } catch (error) {
            console.error('Repository error in findAvailableFlights:', error);
            throw error;
        }
    }

    // Tìm chuyến bay round-trip
    async findRoundTripFlights({ from_airport_id, to_airport_id, departure_date, return_date, seat_class, passenger_count, infant_count = 0, page = 1, limit = 10 }) {
        try {
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;

            console.log('🔄 Repository - Round trip search:', {
                from_airport_id, to_airport_id, departure_date, return_date, seat_class, passenger_count, infant_count, page: pageNum, limit: limitNum
            });

            const outboundFlights = await this.findAvailableFlights({
                from_airport_id,
                to_airport_id,
                departure_date,
                seat_class,
                passenger_count,
                infant_count,
                page: pageNum,
                limit: limitNum
            });

            const inboundFlights = await this.findAvailableFlights({
                from_airport_id: to_airport_id,
                to_airport_id: from_airport_id,
                departure_date: return_date,
                seat_class,
                passenger_count,
                infant_count,
                page: pageNum,
                limit: limitNum
            });

            const roundTripResults = [];

            for (const out of outboundFlights) {
                for (const inc of inboundFlights) {
                    const outFare = out.schedules[0]?.fares?.find(f => !seat_class || f.class_type === seat_class);
                    const incFare = inc.schedules[0]?.fares?.find(f => !seat_class || f.class_type === seat_class);

                    const total_price = ((outFare?.price || 0) + (incFare?.price || 0)) * passenger_count;

                    roundTripResults.push({
                        outbound: out,
                        inbound: inc,
                        total_price
                    });
                }
            }

            return {
                outbound: outboundFlights,
                inbound: inboundFlights,
                combined: roundTripResults
            };

        } catch (error) {
            console.error('Repository error in findRoundTripFlights:', error);
            throw error;
        }
    }
}

module.exports = FlightRepository;
