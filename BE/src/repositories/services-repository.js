const CrudRepository = require('./crud-repository');
const {
    ServiceCatalog,
    ServiceOption,
    FlightServiceOffer,
    BookingServiceItem,
    FlightSchedule
} = require('../models');
const { Op } = require('sequelize');

class ServicesRepository extends CrudRepository {
    constructor() {
        super(ServiceCatalog);
    }

    async getFlightServices(flightScheduleId) {
        try {
            const services = await FlightServiceOffer.findAll({
                where: {
                    flight_schedule_id: flightScheduleId,
                    status: 'available',
                    [Op.or]: [
                        { available_from: null },
                        { available_from: { [Op.lte]: new Date() } }
                    ],
                    [Op.or]: [
                        { available_until: null },
                        { available_until: { [Op.gte]: new Date() } }
                    ]
                },
                attributes: ['id', 'flight_schedule_id', 'service_option_id', 'price_override', 'is_free', 'included_quantity', 'capacity', 'sold_count', 'status'], // ✅ Add service_option_id
                include: [
                    {
                        model: ServiceOption,
                        as: 'serviceOption',
                        required: true,
                        where: {
                            status: 'active'
                        },
                        attributes: ['id', 'code', 'title', 'description', 'price', 'extra_meta'], // ✅ Include id
                        include: [
                            {
                                model: ServiceCatalog,
                                as: 'catalog',
                                required: true,
                                where: {
                                    status: 'active'
                                },
                                attributes: ['id', 'code', 'title', 'description']
                            }
                        ]
                    }
                ],
                order: [['serviceOption', 'catalog', 'title'], ['serviceOption', 'title']]
            });

            console.log(`🔍 Found ${services.length} valid services (filtered out null serviceOptions)`);

            const validServices = services.filter(service =>
                service.serviceOption &&
                service.serviceOption.catalog &&
                service.serviceOption.status === 'active'
            );

            console.log(`✅ After filtering: ${validServices.length} services with valid serviceOptions`);

            // Group services by catalog
            const groupedServices = {};

            validServices.forEach(service => {
                const catalogCode = service.serviceOption.catalog.code;

                if (!groupedServices[catalogCode]) {
                    groupedServices[catalogCode] = {
                        catalog_info: service.serviceOption.catalog,
                        options: []
                    };
                }

                const finalPrice = service.price_override !== null
                    ? service.price_override
                    : service.serviceOption.price;

                groupedServices[catalogCode].options.push({
                    service_offer_id: service.id,  // ✅ FlightServiceOffer ID
                    service_option_id: service.service_option_id,  // ✅ ServiceOption ID
                    option_code: service.serviceOption.code,
                    service_title: service.serviceOption.title,
                    description: service.serviceOption.description,
                    unit_price: finalPrice,
                    currency: 'VND',
                    is_free: service.is_free,
                    included_quantity: service.included_quantity,
                    capacity: service.capacity,
                    sold_count: service.sold_count,
                    available_quantity: service.capacity ? service.capacity - service.sold_count : null,
                    availability: service.status,
                    extra_meta: service.serviceOption.extra_meta
                });
            });

            return groupedServices;
        } catch (error) {
            console.error('Error getting flight services:', error);
            throw error;
        }
    }

    async getServicesByCategory(flightScheduleId, categoryCode) {
        try {
            const services = await FlightServiceOffer.findAll({
                where: {
                    flight_schedule_id: flightScheduleId,
                    status: 'available',
                    [Op.or]: [
                        { available_from: null },
                        { available_from: { [Op.lte]: new Date() } }
                    ],
                    [Op.or]: [
                        { available_until: null },
                        { available_until: { [Op.gte]: new Date() } }
                    ]
                },
                attributes: ['id', 'flight_schedule_id', 'service_option_id', 'is_free', 'included_quantity', 'capacity', 'sold_count', 'price_override', 'status'], // ✅ Add service_option_id & status
                include: [
                    {
                        model: ServiceOption,
                        as: 'serviceOption',
                        required: true,
                        where: {
                            status: 'active'
                        },
                        attributes: ['id', 'code', 'title', 'description', 'price', 'extra_meta', 'status'],
                        include: [
                            {
                                model: ServiceCatalog,
                                as: 'catalog',
                                required: true,
                                where: {
                                    code: categoryCode,
                                    status: 'active'
                                },
                                attributes: ['id', 'code', 'title', 'description']
                            }
                        ]
                    }
                ]
            });

            console.log(`🔍 Found ${services.length} ${categoryCode} services (filtered out null serviceOptions)`);

            const validServices = services.filter(service =>
                service.serviceOption &&
                service.serviceOption.catalog &&
                service.serviceOption.status === 'active' &&
                service.serviceOption.catalog.code === categoryCode
            );

            console.log(`✅ After filtering: ${validServices.length} valid ${categoryCode} services`);

            return validServices;

        } catch (error) {
            console.error('Error getting services by category:', error);
            throw error;
        }
    }

    async checkServiceAvailability(offerIds, quantities) {
        try {
            console.log('🎯 === CHECK AVAILABILITY START ===');
            console.log('Input offer IDs:', offerIds);
            console.log('Input quantities:', quantities);

            const offers = await FlightServiceOffer.findAll({
                where: {
                    id: { [Op.in]: offerIds },
                    status: 'available'
                },
                attributes: ['id', 'service_option_id', 'price_override', 'is_free', 'capacity', 'sold_count'],
                include: [
                    {
                        model: ServiceOption,
                        as: 'serviceOption',
                        required: true,
                        where: { status: 'active' },
                        attributes: ['id', 'title', 'price'],
                        include: [
                            {
                                model: ServiceCatalog,
                                as: 'catalog',
                                required: true,
                                where: { status: 'active' },
                                attributes: ['code', 'title']
                            }
                        ]
                    }
                ]
            });

            console.log(`🔍 Found ${offers.length} offers from database`);
            offers.forEach(offer => {
                console.log(`📋 Offer ${offer.id}: ${offer.serviceOption.title} (${offer.serviceOption.catalog.code})`);
            });

            return offers.map((offer, index) => {
                const requestedQty = quantities[index] || 1;
                const availableQty = offer.capacity ? offer.capacity - offer.sold_count : null;
                const finalPrice = offer.price_override !== null ? offer.price_override : offer.serviceOption.price;

                const result = {
                    service_offer_id: offer.id,
                    service_option_id: offer.service_option_id,
                    service_title: offer.serviceOption.title,
                    category: offer.serviceOption.catalog.code,
                    unit_price: finalPrice,
                    requested_quantity: requestedQty,
                    available_quantity: availableQty,
                    total_price: finalPrice * requestedQty,
                    is_available: !availableQty || availableQty >= requestedQty,
                    is_free: offer.is_free
                };

                console.log(`✅ Result for offer ${offer.id}:`, result);
                return result;
            });

        } catch (error) {
            console.error('❌ Error checking service availability:', error);
            throw error;
        }
    }

    // Add services to booking
    async addServicesToBooking(bookingId, services, transaction = null) {
        try {
            const serviceItems = await Promise.all(
                services.map(service =>
                    BookingServiceItem.create({
                        booking_id: bookingId,
                        booking_flight_id: service.booking_flight_id,
                        booking_passenger_id: service.booking_passenger_id,
                        ticket_id: service.ticket_id,
                        flight_service_offer_id: service.offer_id,
                        service_option_id: service.option_id,
                        quantity: service.quantity,
                        unit_price: service.unit_price,
                        total_price: service.total_price,
                        meta: service.meta,
                        status: 'purchased'
                    }, { transaction })
                )
            );

            const offerUpdates = {};
            services.forEach(service => {
                if (!offerUpdates[service.offer_id]) {
                    offerUpdates[service.offer_id] = 0;
                }
                offerUpdates[service.offer_id] += service.quantity;
            });

            await Promise.all(
                Object.entries(offerUpdates).map(([offerId, quantity]) =>
                    FlightServiceOffer.increment('sold_count', {
                        by: quantity,
                        where: { id: offerId },
                        transaction
                    })
                )
            );

            return serviceItems;
        } catch (error) {
            console.error('Error adding services to booking:', error);
            throw error;
        }
    }

    async getBookingServices(bookingId) {
        try {
            return await BookingServiceItem.findAll({
                where: { booking_id: bookingId },
                include: [
                    {
                        model: ServiceOption,
                        as: 'serviceOption',
                        required: true,
                        include: [
                            {
                                model: ServiceCatalog,
                                as: 'catalog',
                                required: true
                            }
                        ]
                    },
                    {
                        model: FlightServiceOffer,
                        as: 'flightServiceOffer',
                        required: true
                    }
                ]
            });
        } catch (error) {
            console.error('Error getting booking services:', error);
            throw error;
        }
    }
}

module.exports = ServicesRepository;