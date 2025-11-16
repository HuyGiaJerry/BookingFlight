const CrudRepository = require('./crud-repository');
const { Flight, FlightSchedule, Airport, FlightFare, Airline, Airplane, SeatClass, FlightSeat } = require('../models');
const { Op, Sequelize } = require('sequelize');
const { sequelize } = require('../models');

class FlightRepository extends CrudRepository {
    constructor() {
        super(Flight);
    }

    async getAllWithDetails(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 10;

            const { count, rows: items } = await Flight.findAndCountAll({
                attributes: ['id', 'flight_number', 'duration_minutes', 'status'],
                include: [
                    {
                        model: Airport,
                        as: 'departureAirport',
                        attributes: ['id', 'iata_code', 'name', 'city', 'country', 'timezone']
                    },
                    {
                        model: Airport,
                        as: 'arrivalAirport',
                        attributes: ['id', 'iata_code', 'name', 'city', 'country', 'timezone']
                    },
                    {
                        model: Airline,
                        as: 'airline',
                        attributes: ['id', 'name', 'logo_url', 'iata_code']
                    }
                ],
                limit: limitNum,
                offset: offset,
                order: [['id', 'ASC']]
            });

            const pagination = {
                totalPages: Math.ceil(count / limitNum),
                currentPage: pageNum,
                limit: limitNum,
                totalCount: count
            };

            return { items, pagination };
        } catch (error) {
            console.error('Error fetching flights:', error);
            throw error;
        }
    }

    async getFlightByIdWithDetails(flightId) {
        try {
            const flight = await Flight.findByPk(flightId, {
                attributes: ['id', 'flight_number', 'duration_minutes', 'status'],
                include: [
                    {
                        model: Airport,
                        as: 'departureAirport',
                        attributes: ['id', 'iata_code', 'name', 'city', 'country', 'timezone']
                    },
                    {
                        model: Airport,
                        as: 'arrivalAirport',
                        attributes: ['id', 'iata_code', 'name', 'city', 'country']
                    },
                    {
                        model: Airline,
                        as: 'airline',
                        attributes: ['id', 'name', 'logo_url', 'iata_code']
                    }
                ]
            });
            return flight;
        } catch (error) {
            throw error;
        }
    }



    async findAvailableFlightSchedules(params) {
    try {
        const from_airport_id = Number(params.from_airport_id);
        const to_airport_id = Number(params.to_airport_id);
        const departure_date = params.departure_date;
        const passenger_count = Number(params.passenger_count) || 1;
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 10;
        const sort_by = params.sort_by || 'departure_time';
        const sort_order = (params.sort_order || 'ASC').toUpperCase();

        const offset = (page - 1) * limit;
        const seatsNeeded = passenger_count;

        console.log('🔍 Repository - FlightSchedule Search:', {
            from_airport_id, to_airport_id, departure_date, seatsNeeded, page, limit
        });

        // ✅ STEP 1: Get Flight IDs first (separate query to avoid subquery issues)
        const validFlightIds = await Flight.findAll({
            where: {
                departure_airport_id: from_airport_id,
                arrival_airport_id: to_airport_id,
                status: 'active'
            },
            attributes: ['id'],
            raw: true
        });

        if (!validFlightIds || validFlightIds.length === 0) {
            console.log('❌ No flights found for route');
            return {
                data: [],
                pagination: {
                    totalPages: 0,
                    currentPage: page,
                    limit,
                    totalCount: 0
                }
            };
        }

        const flightIds = validFlightIds.map(f => f.id);
        console.log('✅ Found flight IDs:', flightIds);

        // ✅ STEP 2: Get Schedules with direct flight IDs (avoid complex joins)
        const { count, rows: schedules } = await FlightSchedule.findAndCountAll({
            where: {
                flight_id: { [Op.in]: flightIds },
                departure_time: {
                    [Op.between]: [
                        new Date(`${departure_date} 00:00:00`),
                        new Date(`${departure_date} 23:59:59`)
                    ]
                },
                status: 'scheduled'
            },
            attributes: ['id', 'flight_id', 'airplane_id', 'departure_time', 'arrival_time', 'status'],
            include: [
                {
                    model: Airplane,
                    as: 'airplane',
                    attributes: ['id', 'model', 'total_seats'],
                    include: [
                        { 
                            model: Airline, 
                            as: 'airline', 
                            attributes: ['id', 'name', 'logo_url', 'iata_code'] 
                        }
                    ]
                },
                {
                    model: FlightFare,
                    as: 'flightFares',
                    where: {
                        seats_available: { [Op.gte]: seatsNeeded },
                        status: 'available'
                    },
                    required: true,
                    attributes: ['id', 'seat_class_id', 'base_price', 'tax', 'service_fee', 'seats_available', 'total_seats_allocated'],
                    include: [
                        { 
                            model: SeatClass, 
                            as: 'seatClass', 
                            attributes: ['id', 'class_name', 'class_code', 'description'] 
                        }
                    ]
                }
            ],
            distinct: true,
            limit,
            offset,
            order: [[sort_by, sort_order]]
        });

        console.log(`📊 Found ${schedules.length} schedules with available fares`);

        // ✅ STEP 3: Manually attach flight details (avoid complex joins)
        const enrichedSchedules = await Promise.all(
            schedules.map(async (schedule) => {
                const flight = await Flight.findByPk(schedule.flight_id, {
                    attributes: ['id', 'flight_number', 'duration_minutes', 'status'],
                    include: [
                        { 
                            model: Airport, 
                            as: 'departureAirport', 
                            attributes: ['id', 'name', 'iata_code', 'city', 'country'] 
                        },
                        { 
                            model: Airport, 
                            as: 'arrivalAirport', 
                            attributes: ['id', 'name', 'iata_code', 'city', 'country'] 
                        }
                    ]
                });

                return {
                    ...schedule.toJSON(),
                    flight: flight ? flight.toJSON() : null
                };
            })
        );

        // Filter out schedules where flight lookup failed
        const validSchedules = enrichedSchedules.filter(schedule => schedule.flight !== null);

        console.log(`✅ Valid enriched schedules: ${validSchedules.length}`);

        return {
            data: validSchedules,
            pagination: {
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit,
                totalCount: count
            }
        };

    } catch (error) {
        console.error('❌ Repository error in findAvailableFlightSchedules:', error);
        throw error;
    }
}

    async findRoundTripFlightSchedules(params) {
    try {
        console.log('🔄 Repository - Round trip schedule search:', params);

        const [outbound, inbound] = await Promise.all([
            // Outbound: A → B
            this.findAvailableFlightSchedules({
                ...params,
                departure_date: params.departure_date
            }),
            // Inbound: B → A  
            this.findAvailableFlightSchedules({
                ...params,
                departure_date: params.return_date,
                from_airport_id: params.to_airport_id,
                to_airport_id: params.from_airport_id
            })
        ]);

        console.log(`📊 Round trip results: ${outbound.data.length} outbound + ${inbound.data.length} inbound`);

        return { outbound, inbound };

    } catch (error) {
        console.error('❌ Repository error in findRoundTripFlightSchedules:', error);
        throw error;
    }
}





}

module.exports = FlightRepository;
