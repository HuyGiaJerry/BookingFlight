const { StatusCodes } = require('http-status-codes');
const { ServiceOfferService } = require('../services');
const { Responses } = require('../utils/common');

class ServiceOfferController {
    constructor() {
        this.serviceOfferService = new ServiceOfferService();
    }

    /**
     * 🔸 GET /api/v1/services/flight/:flightScheduleId
     * Get all services for specific flight
     */
    getFlightServices = async (req, res, next) => {  // ✅ Add next
        try {
            const { flightScheduleId } = req.params;

            console.log(`🔍 Getting flight services for flight: ${flightScheduleId}`);

            const services = await this.serviceOfferService.servicesRepository.getFlightServices(
                parseInt(flightScheduleId)
            );

            return res.status(StatusCodes.OK).json(Responses.SuccessResponse(services, 'Flight services retrieved successfully'));

        } catch (error) {
            console.error('Error in getFlightServices:', error);
            next(error);
        }
    };

    /**
     * 🔸 GET /api/v1/services/meals/:flightScheduleId
     * Get meal options for specific flight
     */
    getMealOptions = async (req, res, next) => {  // ✅ Add next
        try {
            const { flightScheduleId } = req.params;
            const { passenger_count = 1 } = req.query;

            console.log(`🍽️ Getting meal options for flight: ${flightScheduleId}, passengers: ${passenger_count}`);

            const mockPassengers = Array(parseInt(passenger_count)).fill({ type: 'adult' });
            const meals = await this.serviceOfferService.getMealOptions(
                parseInt(flightScheduleId),
                mockPassengers
            );

            return res.status(StatusCodes.OK).json(Responses.SuccessResponse(meals, 'Meal options retrieved successfully'));

        } catch (error) {
            console.error('Error in getMealOptions:', error);
            next(error);
        }
    };

    /**
     * 🔸 GET /api/v1/services/baggage/:flightScheduleId
     * Get baggage options for specific flight
     */
    getBaggageOptions = async (req, res, next) => {  // ✅ Add next
        try {
            const { flightScheduleId } = req.params;
            const { passenger_count = 1 } = req.query;

            console.log(`👜 Getting baggage options for flight: ${flightScheduleId}, passengers: ${passenger_count}`);

            const mockPassengers = Array(parseInt(passenger_count)).fill({ type: 'adult' });
            const baggage = await this.serviceOfferService.getBaggageOptions(
                parseInt(flightScheduleId),
                mockPassengers
            );

            return res.status(StatusCodes.OK).json(Responses.SuccessResponse(baggage, 'Baggage options retrieved successfully'));

        } catch (error) {
            console.error('Error in getBaggageOptions:', error);
            next(error);
        }
    };

    /**
     * 🔸 POST /api/v1/services/check-availability
     * Check service availability for multiple selections
     */
    checkServiceAvailability = async (req, res, next) => {  // ✅ Add next
        try {
            const { service_selections } = req.body;

            console.log('🔍 CHECK AVAILABILITY REQUEST:', JSON.stringify(req.body, null, 2));

            if (!service_selections || !Array.isArray(service_selections)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'service_selections array is required',
                    error_code: 'INVALID_REQUEST'
                });
            }

            console.log(`🔍 Checking availability for ${service_selections.length} services`);

            const offerIds = service_selections.map(s => s.offer_id);
            const quantities = service_selections.map(s => s.quantity || 1);

            console.log('🎯 Extracted offer IDs:', offerIds);
            console.log('🔢 Extracted quantities:', quantities);

            const availability = await this.serviceOfferService.servicesRepository.checkServiceAvailability(
                offerIds,
                quantities
            );

            console.log('✅ Availability result:', JSON.stringify(availability, null, 2));

            return res.status(StatusCodes.OK).json(Responses.SuccessResponse(availability, 'Service availability checked successfully'));

        } catch (error) {
            console.error('❌ Error in checkServiceAvailability:', error);
            next(error);
        }
    };



}

module.exports = ServiceOfferController;