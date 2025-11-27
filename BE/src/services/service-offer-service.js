const { ServicesRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');

class ServiceOfferService {
    constructor() {
        this.servicesRepository = new ServicesRepository();
    }

    async getBookingServiceOptions(bookingFlights, passengers) {
        try {
            const serviceOptions = {};

            for (const flight of bookingFlights) {
                const flightServices = await this.servicesRepository.getFlightServices(
                    flight.flight_schedule_id
                );

                serviceOptions[flight.id] = {
                    flight_info: flight,
                    services: flightServices,
                    passenger_count: passengers.length
                };
            }

            return {
                booking_flights: bookingFlights,
                passengers: passengers,
                service_options: serviceOptions
            };
        } catch (error) {
            console.error('Error getting booking service options:', error);
            throw error;
        }
    }

    async getMealOptions(flightScheduleId, passengers) {
        try {
            console.log(`🍽️ Getting meal options for flight: ${flightScheduleId}`);

            const mealServices = await this.servicesRepository.getServicesByCategory(
                flightScheduleId,
                'MEAL'
            );

            console.log(`🔍 Raw meal services count: ${mealServices.length}`);

            // ✅ FILTER và FORMAT meal options với service_option_id
            const formattedMeals = mealServices
                .filter(service =>
                    service.serviceOption &&
                    service.serviceOption.catalog &&
                    service.serviceOption.status === 'active'
                )
                .map(service => {
                    const finalPrice = service.price_override !== null
                        ? service.price_override
                        : service.serviceOption.price;

                    return {
                        service_offer_id: service.id,  // ✅ FlightServiceOffer ID
                        service_option_id: service.service_option_id,  // ✅ ServiceOption ID
                        service_title: service.serviceOption.title,
                        description: service.serviceOption.description || '',
                        unit_price: finalPrice,
                        currency: 'VND',
                        is_free: service.is_free,
                        dietary_info: service.serviceOption.extra_meta?.dietary || [],
                        image_url: service.serviceOption.extra_meta?.image_url || null,
                        availability: service.status,
                        available_quantity: service.capacity ? service.capacity - service.sold_count : null,
                        capacity: service.capacity,
                        sold_count: service.sold_count,
                        included_quantity: service.included_quantity || 0
                    };
                });

            console.log(`✅ Formatted meal options: ${formattedMeals.length}`);

            return {
                flight_schedule_id: flightScheduleId,
                meal_options: formattedMeals,
                passenger_count: passengers.length,
                total_options: formattedMeals.length
            };

        } catch (error) {
            console.error('Error getting meal options:', error);
            throw error;
        }
    }

    async getBaggageOptions(flightScheduleId, passengers) {
        try {
            console.log(`👜 Getting baggage options for flight: ${flightScheduleId}`);

            const baggageServices = await this.servicesRepository.getServicesByCategory(
                flightScheduleId,
                'BAGGAGE'
            );

            console.log(`🔍 Raw baggage services count: ${baggageServices.length}`);

            // ✅ FILTER và FORMAT baggage options với service_option_id
            const formattedBaggage = baggageServices
                .filter(service =>
                    service.serviceOption &&
                    service.serviceOption.catalog &&
                    service.serviceOption.status === 'active'
                )
                .map(service => {
                    const finalPrice = service.price_override !== null
                        ? service.price_override
                        : service.serviceOption.price;

                    return {
                        service_offer_id: service.id,  // ✅ FlightServiceOffer ID
                        service_option_id: service.service_option_id,  // ✅ ServiceOption ID
                        service_title: service.serviceOption.title,
                        description: service.serviceOption.description || '',
                        unit_price: finalPrice,
                        currency: 'VND',
                        is_free: service.is_free,
                        weight_limit_kg: service.serviceOption.extra_meta?.weight_kg || null,
                        baggage_type: service.serviceOption.extra_meta?.baggage_type || 'checked',
                        availability: service.status,
                        available_quantity: service.capacity ? service.capacity - service.sold_count : null,
                        capacity: service.capacity,
                        sold_count: service.sold_count,
                        included_quantity: service.included_quantity || 0
                    };
                });

            console.log(`✅ Formatted baggage options: ${formattedBaggage.length}`);

            return {
                flight_schedule_id: flightScheduleId,
                baggage_options: formattedBaggage,
                passenger_count: passengers.length,
                total_options: formattedBaggage.length
            };

        } catch (error) {
            console.error('Error getting baggage options:', error);
            throw error;
        }
    }

    
}

module.exports = ServiceOfferService;