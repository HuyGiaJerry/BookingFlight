const { StatusCodes } = require('http-status-codes');
const { FlightService, AirportService } = require('../services');
const { Responses } = require('../utils/common');
const redisClient = require('../config/redis');
const FlightSearchService = require('../services/flightSearchService');
const { applyFiltersAndSorting } = require('../utils/searchProcessor');

const flightService = new FlightService();
const airportService = new AirportService();

async function createFlight(req, res, next) {
    try {
        console.log('Controller - Creating flight:', req.body);
        const flight = await flightService.createFlight(req.body);
        return res
            .status(StatusCodes.CREATED)
            .json(Responses.SuccessResponse(flight, 'Flight created successfully'));
    } catch (error) {
        console.error('Controller error in createFlight:', error);
        next(error);
    }
}

async function getAllFlights(req, res, next) {
    try {
        console.log('Controller - Getting all flights, query:', req.query);

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const { items, pagination } = await flightService.getAllFlights(page, limit);

        return res
            .status(StatusCodes.OK)
            .json(Responses.PaginationResponse(items, pagination, 'Flights retrieved successfully'));
    } catch (error) {
        console.error('Controller error in getAllFlights:', error);
        next(error);
    }
}

async function getFlightById(req, res, next) {
    try {
        console.log('Controller - Getting flight by ID:', req.params.id);

        const flight = await flightService.getFlightById(req.params.id);

        return res
            .status(StatusCodes.OK)
            .json(Responses.SuccessResponse(flight, 'Flight retrieved successfully'));
    } catch (error) {
        console.error('Controller error in getFlightById:', error);
        next(error);
    }
}

async function updateFlight(req, res, next) {
    try {
        console.log('Controller - Updating flight:', req.params.id, req.body);

        const flight = await flightService.updateFlight(req.params.id, req.body);

        return res
            .status(StatusCodes.OK)
            .json(Responses.SuccessResponse(flight, 'Flight updated successfully'));
    } catch (error) {
        console.error('Controller error in updateFlight:', error);
        next(error);
    }
}

async function deleteFlight(req, res, next) {
    try {
        console.log('Controller - Deleting flight:', req.params.id);

        const flight = await flightService.deleteFlight(req.params.id);

        return res
            .status(StatusCodes.OK)
            .json(Responses.SuccessResponse(flight, 'Flight deleted successfully'));
    } catch (error) {
        console.error('Controller error in deleteFlight:', error);
        next(error);
    }
}

// ✅ UPDATED: Enhanced search with schedule pagination and sorting
async function searchFlights(req, res, next) {
    try {
        console.log('🎯 Controller - Flight search initiated');
        console.log('📋 Search criteria received:', req.query);

        // Validate that we have some search criteria
        if (!req.query || Object.keys(req.query).length === 0) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(Responses.ErrorResponse(
                    { message: 'No search criteria provided' },
                    'Search criteria required'
                ));
        }
        const searchCriteria = req.query;

        // Call service method
        const searchResults = await flightService.searchFlights(searchCriteria);

        console.log('✅ Flight search completed successfully');
        console.log('📊 Results summary:', {
            trip_type: searchResults.trip_type,
            success: searchResults.success,
            has_results: searchResults.results ? 'yes' : 'no',
            // ✅ NEW: Log schedule-based results
            total_schedules: searchResults.trip_type === 'one-way' ?
                searchResults.results?.summary?.total_schedules :
                (searchResults.results?.summary?.outbound_schedules || 0) +
                (searchResults.results?.summary?.inbound_schedules || 0),
            pagination_type: 'schedule-based' // ✅ NEW
        });

        // Return formatted response
        return res
            .status(StatusCodes.OK)
            .json(Responses.SuccessResponse(searchResults, 'Flight search completed successfully'));

    } catch (error) {
        console.error('❌ Controller error in searchFlights:', error);

        // Log error details for debugging
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR
        });

        next(error);
    }
}

async function fullSearch(req, res) {
    try {
        const { ap, dt, ps, sc } = req.query;


        const baseKey = `fullsearch:${ap}:${dt}:${ps}:${sc}`;
        console.log("PING:", await redisClient.ping());
        console.log("Check BEFORE GET:");
        console.log("TTL before get:", await redisClient.ttl(baseKey));

        // Check cache
        let cached = await redisClient.get(baseKey)


        if (cached) {

            cached = JSON.parse(cached)

            // Xử lý filter + sort
            const processed = applyFiltersAndSorting(cached, req.query)

            return res.json({
                success: true,
                data: processed,
                meta: {
                    total: processed.length,
                    query: req.query,
                    timestamp: new Date().toISOString()
                }
            })
        }
        console.log('callback full search')

        const data = await FlightSearchService.fullSearch(req.query);

        // set cache
        await redisClient.set(baseKey, JSON.stringify(data), {
            EX: 600
        });

        const processed = applyFiltersAndSorting(data, req.query);

        return res.status(200).json({
            success: true,
            data: processed,
            meta: {
                total: processed.flights.length,
                query: req.query,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Flight search error:', error);
        return res.status(400).json({
            success: false,
            message: error.message || 'Flight search failed',
            data: null
        });
    }
}



module.exports = {
    createFlight,
    getAllFlights,
    getFlightById,
    updateFlight,
    deleteFlight,
    searchFlights,
    fullSearch,
};