const CrudRepository = require('./crud-repository');
const { BookingService, ExtraService } = require('../models');

class BookingServiceRepository extends CrudRepository {
    constructor() {
        super(BookingService);
    }

    async createBookingServices(servicesData) {
        try {
            const bookingServices = await Promise.all(
                servicesData.map(serviceData => this.create(serviceData))
            );
            return bookingServices;
        } catch (error) {
            throw error;
        }
    }

    async getBookingServicesByBookingId(bookingId) {
        try {
            const services = await BookingService.findAll({
                where: { booking_id: bookingId },
                include: [
                    {
                        model: ExtraService,
                        as: 'service',
                        attributes: ['service_type', 'price', 'description']
                    }
                ]
            });
            return services;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = BookingServiceRepository;