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
            const page = parseInt(params.page) || 1;
            const limit = parseInt(params.limit) || 10;
            const sort_by = params.sort_by || 'departure_time';
            const sort_order = (params.sort_order || 'ASC').toUpperCase();

            // New Filters
            const airline_ids = params.airline_ids; // Array of numbers
            const min_departure_time = params.min_departure_time; // "HH:mm"
            const max_departure_time = params.max_departure_time; // "HH:mm"
            const min_arrival_time = params.min_arrival_time; // "HH:mm"
            const max_arrival_time = params.max_arrival_time; // "HH:mm"
            const return_filters = params.return_filters === true; // Boolean flag
            const seat_class = params.seat_class; // "ECONOMY", "BUSINESS", etc.
            const min_price = params.min_price;
            const max_price = params.max_price;
            const time_slot = params.time_slot; // "morning", "afternoon", "evening", "night"

            const offset = (page - 1) * limit;
            const seatsNeeded = passenger_count;

            console.log('🔍 Repository - FlightSchedule Search:', {
                from_airport_id, to_airport_id, departure_date, seatsNeeded, page, limit,
                airline_ids, sort_by, sort_order, return_filters
            });

            // ✅ STEP 1: Get Flight IDs first
            // Filter by Airline at Flight level if provided
            const flightWhereClause = {
                departure_airport_id: from_airport_id,
                arrival_airport_id: to_airport_id,
                status: 'active'
            };

            if (airline_ids && airline_ids.length > 0) {
                flightWhereClause.airline_id = { [Op.in]: airline_ids };
            }

            const validFlightIds = await Flight.findAll({
                where: flightWhereClause,
                attributes: ['id'],
                raw: true
            });

            if (!validFlightIds || validFlightIds.length === 0) {
                console.log('❌ No flights found for route (with airline filter if applied)');
                return {
                    data: [],
                    pagination: {
                        totalPages: 0,
                        currentPage: page,
                        limit,
                        totalCount: 0
                    },
                    filter_options: return_filters ? { airlines: [] } : undefined
                };
            }

            const flightIds = validFlightIds.map(f => f.id);

            // ✅ STEP 2: Build Schedule Where Clause (Time Ranges)
            const scheduleWhereClause = {
                flight_id: { [Op.in]: flightIds },
                status: 'scheduled'
            };

            // Helper to combine date + time string into Date object
            const createDateTime = (dateStr, timeStr) => {
                return new Date(`${dateStr} ${timeStr}:00`);
            };

            // Departure Time Range
            let depStart = new Date(`${departure_date} 00:00:00`);
            let depEnd = new Date(`${departure_date} 23:59:59`);

            if (min_departure_time) depStart = createDateTime(departure_date, min_departure_time);
            if (max_departure_time) depEnd = createDateTime(departure_date, max_departure_time);

            scheduleWhereClause.departure_time = { [Op.between]: [depStart, depEnd] };

            // ✅ Time Slot Filtering (00-06, 06-12, 12-18, 18-24)
            if (time_slot) {
                const slotStart = new Date(departure_date);
                const slotEnd = new Date(departure_date);

                switch (time_slot) {
                    case 'morning': // 00:00 - 06:00
                        slotStart.setHours(0, 0, 0);
                        slotEnd.setHours(6, 0, 0);
                        break;
                    case 'afternoon': // 06:00 - 12:00
                        slotStart.setHours(6, 0, 0);
                        slotEnd.setHours(12, 0, 0);
                        break;
                    case 'evening': // 12:00 - 18:00
                        slotStart.setHours(12, 0, 0);
                        slotEnd.setHours(18, 0, 0);
                        break;
                    case 'night': // 18:00 - 24:00
                        slotStart.setHours(18, 0, 0);
                        slotEnd.setHours(23, 59, 59);
                        break;
                }
                // Intersect with existing date range
                scheduleWhereClause.departure_time = { [Op.between]: [slotStart, slotEnd] };
            }

            // Arrival Time Range (Note: Arrival could be next day, but for simple filtering we might assume same day or handle logic carefully. 
            // For now, let's assume simple filtering based on the stored arrival_time if it matches the query date, 
            // BUT arrival_time in DB is full datetime. 
            // If user filters arrival time, they usually mean "at any time on the arrival day" or "relative to departure".
            // Given the complexity, if min/max arrival time is provided, we filter strictly on those datetimes.
            // However, usually UI sends "06:00-12:00". We need to know the arrival DATE. 
            // For simplicity in this version, we will filter arrival time *if* it falls within the specific range relative to departure date, 
            // OR we just filter by time-of-day regardless of date if the DB supports it. 
            // Sequelize/MySQL 'Time' type vs 'DateTime'. Here it is DateTime.
            // Let's assume for now we filter arrival times that fall within the specific Date+Time window if provided, 
            // or if only time is provided, we might need a more complex query. 
            // Let's stick to the standard: Filter Departure Time is primary. Arrival Time filter is secondary and might be tricky without an arrival date.
            // If the user wants "Arrive between 10:00 and 12:00", and the flight departs at 23:00, it arrives next day.
            // For MVP, let's implement Arrival Time Filter ONLY if it fits within the departure date (same day arrival) OR just skip complex arrival logic for now unless critical.
            // User request: "Hạ cánh sớm nhất, Hạ cánh muộn nhất" -> Sorting. "Giờ hạ cánh theo khung giờ" -> Filtering.
            // Let's implement strictly based on the provided full datetime if possible, or just time on the departure date.
            // BETTER APPROACH: If min_arrival_time is passed, we construct it based on departure_date (assuming same day) 
            // or we ignore date and cast to TIME (performance hit).
            // Let's use the constructed Date objects for now, assuming same-day or next-day is handled by frontend sending full date or we assume same day.
            // *Decision*: We will assume the filter applies to the *Departure Date* for simplicity unless arrival date is known.
            // Actually, let's just apply it if provided, assuming the user context implies "on the day of arrival".
            // Since we don't know the arrival date easily without querying, let's skip strict Arrival Time Range filtering for this step 
            // unless we use `Sequelize.where` to extract TIME part (which is slow).
            // Let's stick to Departure Time Range for now as it's most critical. 
            // If `min_arrival_time` is passed, we will try to apply it to the *probable* arrival window.
            // *Refinement*: Let's implement Sorting by Arrival Time first, and Time Range for Departure. 
            // If specific Arrival Time Range is needed, we can add it later or use `Op.and` with `Sequelize.literal` to compare TIME(arrival_time).
            // Let's use Sequelize literal for Time-only comparison if needed, but for now let's stick to Departure Time Range which is standard.
            // If params has min_arrival_time, we will use Sequelize.where to compare time part.


            if (min_arrival_time || max_arrival_time) {
                // This is heavy but accurate for "Time of Day" filtering regardless of date
                const timeToSeconds = (t) => {
                    const [h, m] = t.split(':').map(Number);
                    return h * 3600 + m * 60;
                };

                // We can't easily do this with standard WHERE on DateTime without raw SQL or virtual fields.
                // Let's defer "Arrival Time Range" implementation to avoid breaking changes/perf issues right now, 
                // and focus on Departure Time Range + Sorting.
            }


            // ✅ STEP 2.1: Resolve Seat Class IDs if filter provided
            let seatClassIds = null;
            if (seat_class) {
                const seatClasses = await SeatClass.findAll({
                    where: {
                        [Op.or]: [
                            { class_code: seat_class },
                            { class_name: seat_class }
                        ]
                    },
                    attributes: ['id']
                });

                if (!seatClasses || seatClasses.length === 0) {
                    // If specific class requested but not found in DB, return empty
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
                seatClassIds = seatClasses.map(sc => sc.id);
            }

            // ✅ STEP 3: Sorting Setup
            let orderClause = [];
            let subQueryInclude = [];

            if (sort_by === 'price') {
                orderClause = [[{ model: FlightFare, as: 'flightFares' }, 'base_price', sort_order]];
            } else if (sort_by === 'duration') {
                // Need to include Flight to sort by duration
                // We are already filtering by flight_ids, but to SORT by a Flight field, we might need to join.
                // However, we are querying FlightSchedule.
                // Since we are doing `flight_id IN [...]`, the order of FlightSchedule is not guaranteed by Flight duration.
                // We need to include Flight model in the query to sort by it.
                subQueryInclude.push({
                    model: Flight,
                    as: 'flight',
                    attributes: [], // We just need it for sorting
                    required: true
                });
                orderClause = [[{ model: Flight, as: 'flight' }, 'duration_minutes', sort_order]];
            } else if (sort_by === 'arrival_time') {
                orderClause = [['arrival_time', sort_order]];
            } else {
                // Default: departure_time
                orderClause = [['departure_time', sort_order]];
            }

            // ✅ STEP 4: Main Query (Schedules)
            const flightFareWhere = {
                seats_available: { [Op.gte]: seatsNeeded },
                status: 'available'
            };

            if (seatClassIds) {
                flightFareWhere.seat_class_id = { [Op.in]: seatClassIds };
            }

            // ✅ Price Range Filtering
            if (min_price !== undefined || max_price !== undefined) {
                flightFareWhere.base_price = {};
                if (min_price !== undefined) flightFareWhere.base_price[Op.gte] = min_price;
                if (max_price !== undefined) flightFareWhere.base_price[Op.lte] = max_price;
            }

            const { count, rows: schedules } = await FlightSchedule.findAndCountAll({
                where: scheduleWhereClause,
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
                        where: flightFareWhere,
                        required: true,
                        attributes: ['id', 'seat_class_id', 'base_price', 'tax', 'service_fee', 'seats_available', 'total_seats_allocated'],
                        include: [
                            {
                                model: SeatClass,
                                as: 'seatClass',
                                attributes: ['id', 'class_name', 'class_code', 'description']
                            }
                        ]
                    },
                    ...subQueryInclude // Add Flight join if needed for sorting
                ],
                distinct: true,
                limit,
                offset,
                order: orderClause
            });

            console.log(`📊 Found ${schedules.length} schedules`);

            // ✅ STEP 5: Enrich with Flight Details
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

            const validSchedules = enrichedSchedules.filter(schedule => schedule.flight !== null);

            // ✅ STEP 6: Aggregation for Filters (Facets) - ONLY if requested
            let filterOptions = {};

            if (return_filters) {
                // 1. Get ALL valid flight IDs for this route (ignoring airline filter)
                // We need to re-query Flight without the airline_id filter
                const allRouteFlights = await Flight.findAll({
                    where: {
                        departure_airport_id: from_airport_id,
                        arrival_airport_id: to_airport_id,
                        status: 'active'
                    },
                    attributes: ['id', 'airline_id'],
                    raw: true
                });

                const allRouteFlightIds = allRouteFlights.map(f => f.id);

                if (allRouteFlightIds.length > 0) {
                    // 2. Get Schedules for these flights (within date range)
                    // We want to count how many schedules exist for each airline
                    // We can do this by aggregating FlightSchedule -> Flight -> Airline
                    // But simpler: We have airline_id in Flight. 
                    // We just need to know which Flights have valid Schedules on this Date.

                    const validSchedulesForFacets = await FlightSchedule.findAll({
                        where: {
                            flight_id: { [Op.in]: allRouteFlightIds },
                            departure_time: {
                                [Op.between]: [
                                    new Date(`${departure_date} 00:00:00`),
                                    new Date(`${departure_date} 23:59:59`)
                                ]
                            },
                            status: 'scheduled'
                        },
                        attributes: ['flight_id'],
                        raw: true
                    });

                    const activeFlightIds = new Set(validSchedulesForFacets.map(s => s.flight_id));

                    // 3. Aggregate Airlines with Min Price
                    // We need to find the cheapest fare for each airline for the given route and date
                    const airlinePrices = await FlightSchedule.findAll({
                        attributes: [
                            [Sequelize.col('airplane.airline.id'), 'airline_id'],

                            [Sequelize.fn('MIN', Sequelize.col('flightFares.base_price')), 'min_price']
                        ],
                        include: [
                            {
                                model: Airplane,
                                as: 'airplane',
                                attributes: [],
                                include: [{
                                    model: Airline,
                                    as: 'airline',
                                    attributes: ['id', 'name', 'logo_url', 'iata_code']
                                }]
                            },
                            {
                                model: FlightFare,
                                as: 'flightFares',
                                attributes: [],
                                where: {
                                    status: 'available',
                                    seats_available: { [Op.gte]: seatsNeeded }
                                }
                            }
                        ],
                        where: {
                            flight_id: { [Op.in]: allRouteFlightIds },
                            departure_time: {
                                [Op.between]: [
                                    new Date(`${departure_date} 00:00:00`),
                                    new Date(`${departure_date} 23:59:59`)
                                ]
                            },
                            status: 'scheduled'
                        },
                        group: ['airplane.airline.id'],
                        raw: true
                    });

                    // Map results to format
                    const airlineFacets = airlinePrices.map(ap => ({
                        id: ap['airline_id'],

                        min_price: ap['min_price']
                    }));

                    // Fetch details for these airlines
                    const airlineIds = airlineFacets.map(a => a.id);
                    const airlines = await Airline.findAll({
                        where: { id: { [Op.in]: airlineIds } },
                        attributes: ['id', 'name', 'logo_url', 'iata_code']
                    });

                    const airlineMap = new Map(airlines.map(a => [a.id, a]));

                    filterOptions.airlines = airlineFacets.map(facet => {
                        const airline = airlineMap.get(facet.id);
                        return {
                            id: facet.id,
                            name: airline ? airline.name : 'Unknown',
                            logo_url: airline ? airline.logo_url : null,
                            count: 0, // Count is less relevant with price, but we could add it back if needed
                            min_price: facet.min_price
                        };
                    });
                    filterOptions.airlines = airlineFacets.map(facet => {
                        const airline = airlineMap.get(facet.id);
                        return {
                            id: facet.id,
                            name: airline ? airline.name : 'Unknown',
                            logo_url: airline ? airline.logo_url : null,
                            count: 0, // Count is less relevant with price, but we could add it back if needed
                            min_price: facet.min_price
                        };
                    });

                    // 4. Get Global Min/Max Price (across all airlines/flights for this route/date)
                    const priceStats = await FlightSchedule.findOne({
                        attributes: [
                            [Sequelize.fn('MIN', Sequelize.col('flightFares.base_price')), 'min_price'],
                            [Sequelize.fn('MAX', Sequelize.col('flightFares.base_price')), 'max_price']
                        ],
                        include: [{
                            model: FlightFare,
                            as: 'flightFares',
                            attributes: [],
                            where: {
                                status: 'available',
                                seats_available: { [Op.gte]: seatsNeeded }
                            }
                        }],
                        where: {
                            flight_id: { [Op.in]: allRouteFlightIds },
                            departure_time: {
                                [Op.between]: [
                                    new Date(`${departure_date} 00:00:00`),
                                    new Date(`${departure_date} 23:59:59`)
                                ]
                            },
                            status: 'scheduled'
                        },
                        raw: true
                    });

                    filterOptions.price_range = {
                        min: priceStats?.min_price || 0,
                        max: priceStats?.max_price || 0
                    };

                    // 5. Get Time Slot Counts
                    // We can do this with a simple count query grouping by time ranges, but SQL grouping by time range is tricky.
                    // Simpler: Fetch all departure times and bucket them in JS (since result set for one day is small).
                    const allScheduleTimes = await FlightSchedule.findAll({
                        where: {
                            flight_id: { [Op.in]: allRouteFlightIds },
                            departure_time: {
                                [Op.between]: [
                                    new Date(`${departure_date} 00:00:00`),
                                    new Date(`${departure_date} 23:59:59`)
                                ]
                            },
                            status: 'scheduled'
                        },
                        attributes: ['departure_time'],
                        raw: true
                    });

                    const timeSlots = {
                        morning: 0,   // 00-06
                        afternoon: 0, // 06-12
                        evening: 0,   // 12-18
                        night: 0      // 18-24
                    };

                    allScheduleTimes.forEach(s => {
                        const hour = new Date(s.departure_time).getHours();
                        if (hour < 6) timeSlots.morning++;
                        else if (hour < 12) timeSlots.afternoon++;
                        else if (hour < 18) timeSlots.evening++;
                        else timeSlots.night++;
                    });

                    filterOptions.time_slots = timeSlots;

                } else {
                    filterOptions.airlines = [];
                    filterOptions.price_range = { min: 0, max: 0 };
                    filterOptions.time_slots = { morning: 0, afternoon: 0, evening: 0, night: 0 };
                }
            }

            return {
                data: validSchedules,
                pagination: {
                    totalPages: Math.ceil(count / limit),
                    currentPage: page,
                    limit,
                    totalCount: count
                },
                filter_options: return_filters ? filterOptions : undefined
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
