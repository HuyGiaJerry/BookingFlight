const { StatusCodes } = require('http-status-codes');
const { FlightService } = require('../services');
const { Responses } = require('../utils/common');

const flightService = new FlightService();

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

        // ✅ NEW: Log enhanced search parameters including sorting
        console.log('🔍 Key search params:', {
            trip_type: searchCriteria.trip_type,
            from_airport_id: searchCriteria.from_airport_id,
            to_airport_id: searchCriteria.to_airport_id,
            from_iata: searchCriteria.from_iata,
            to_iata: searchCriteria.to_iata,
            departure_date: searchCriteria.departure_date,
            return_date: searchCriteria.return_date,
            passenger_count: searchCriteria.passenger_count,
            infant_count: searchCriteria.infant_count,
            preferred_class: searchCriteria.preferred_class,
            sort_by: searchCriteria.sort_by,        // ✅ NEW
            sort_order: searchCriteria.sort_order,  // ✅ NEW
            page: searchCriteria.page,
            limit: searchCriteria.limit
        });

        // ✅ NEW: Validate sorting parameters
        const validSortFields = ['departure_time', 'price', 'duration'];
        const validSortOrders = ['ASC', 'DESC', 'asc', 'desc'];

        if (searchCriteria.sort_by && !validSortFields.includes(searchCriteria.sort_by)) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(Responses.ErrorResponse(
                    {
                        message: `Invalid sort_by field. Valid options: ${validSortFields.join(', ')}`,
                        provided: searchCriteria.sort_by,
                        valid_options: validSortFields
                    },
                    'Invalid sorting parameter'
                ));
        }

        if (searchCriteria.sort_order && !validSortOrders.includes(searchCriteria.sort_order)) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(Responses.ErrorResponse(
                    {
                        message: `Invalid sort_order. Valid options: ${validSortOrders.join(', ')}`,
                        provided: searchCriteria.sort_order,
                        valid_options: validSortOrders
                    },
                    'Invalid sorting parameter'
                ));
        }

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


module.exports = {
    createFlight,
    getAllFlights,
    getFlightById,
    updateFlight,
    deleteFlight,
    searchFlights,      // ✅ UPDATED
};