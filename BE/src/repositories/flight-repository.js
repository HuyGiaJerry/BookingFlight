const CrudRepository = require('./crud-repository');
const { Flight, FlightSchedule, Airport, FlightScheduleFare, Airline, Airplane } = require('../models');
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


    async findAvailableFlights(fromAirportId, toAirportId, date, classType) {
        try {
            console.log('🔍 Repository - Search params:', {
                fromAirportId, toAirportId, date, classType
            });

            // Step 1: Tìm flights với schedules
            const flights = await Flight.findAll({
                where: {
                    departure_airport_id: fromAirportId,
                    arrival_airport_id: toAirportId
                },
                include: [
                    {
                        model: FlightSchedule,
                        as: 'schedules',
                        where: {
                            departure_time: {
                                [Op.between]: [
                                    new Date(`${date}T00:00:00`),
                                    new Date(`${date}T23:59:59`)
                                ]
                            }
                        },
                        attributes: ['id', 'flight_id', 'departure_time', 'arrival_time', 'price', 'available_seat', 'flight_schedule_status']
                    },
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

            if (!flights || flights.length === 0) {
                console.log('❌ No flights found');
                return [];
            }

            console.log('✅ Found flights before filtering:', flights.length);

            // Step 2: Lấy tất cả schedule IDs
            const scheduleIds = [];
            flights.forEach(flight => {
                flight.schedules.forEach(schedule => {
                    scheduleIds.push(schedule.id);
                });
            });

            console.log('📅 Schedule IDs:', scheduleIds);

            // Step 3: Query fares riêng biệt
            const fareConditions = {
                flight_schedule_id: {
                    [Op.in]: scheduleIds
                }
            };

            // Thêm điều kiện class_type nếu có
            if (classType) {
                fareConditions.class_type = classType;
                console.log('🎫 Filtering by class_type:', classType);
            }

            const fares = await FlightScheduleFare.findAll({
                where: fareConditions,
                attributes: ['id', 'flight_schedule_id', 'class_type', 'price', 'seat_allocated']
            });

            console.log('💰 Found fares:', fares.length);

            // Step 4: Group fares theo schedule_id
            const faresBySchedule = fares.reduce((acc, fare) => {
                if (!acc[fare.flight_schedule_id]) {
                    acc[fare.flight_schedule_id] = [];
                }
                acc[fare.flight_schedule_id].push({
                    id: fare.id,
                    class_type: fare.class_type,
                    price: fare.price,
                    seat_allocated: fare.seat_allocated
                });
                return acc;
            }, {});

            console.log('📊 Fares by schedule:', Object.keys(faresBySchedule));

            // Step 5: Filter và attach fares vào schedules
            const filteredFlights = [];

            flights.forEach(flight => {
                const validSchedules = [];

                flight.schedules.forEach(schedule => {
                    const scheduleFares = faresBySchedule[schedule.id] || [];

                    // Nếu có class_type filter, chỉ giữ schedules có fare với class đó
                    if (classType) {
                        if (scheduleFares.length > 0) {
                            // Có fare với class_type phù hợp
                            schedule.dataValues.fares = scheduleFares;
                            validSchedules.push(schedule);
                            console.log(`✅ Schedule ${schedule.id} has ${classType} class`);
                        } else {
                            // Không có fare với class_type này
                            console.log(`❌ Schedule ${schedule.id} doesn't have ${classType} class`);
                        }
                    } else {
                        // Không có filter, lấy tất cả fares
                        schedule.dataValues.fares = scheduleFares;
                        validSchedules.push(schedule);
                    }
                });

                // Chỉ thêm flight nếu có ít nhất 1 valid schedule
                if (validSchedules.length > 0) {
                    flight.schedules = validSchedules;
                    filteredFlights.push(flight);
                    console.log(`✅ Flight ${flight.flight_number} has ${validSchedules.length} valid schedules`);
                } else {
                    console.log(`❌ Flight ${flight.flight_number} has no valid schedules`);
                }
            });

            console.log('✅ Repository - Final filtered flights:', filteredFlights.length);
            return filteredFlights;

        } catch (error) {
            console.error('❌ Repository error:', error);
            throw error;
        }
    }

    // Tìm chuyến bay round-trip
    async findRoundTripFlights(fromAirportId, toAirportId, departureDate, returnDate, classType) {
        try {
            console.log('🔄 Repository - Round trip search');

            // Outbound flights (đi)
            const outboundFlights = await this.findAvailableFlights(
                fromAirportId,
                toAirportId,
                departureDate,
                classType
            );

            // Inbound flights (về)
            const inboundFlights = await this.findAvailableFlights(
                toAirportId,
                fromAirportId,
                returnDate,
                classType
            );

            console.log('✅ Round trip results:', {
                outbound: outboundFlights.length,
                inbound: inboundFlights.length
            });

            return {
                outbound: outboundFlights,
                inbound: inboundFlights
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = FlightRepository;