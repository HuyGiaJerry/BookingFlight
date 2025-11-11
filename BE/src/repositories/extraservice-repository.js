const CrudRepository = require('./crud-repository');
const { ExtraService } = require('../models');

class ExtraServiceRepository extends CrudRepository {
    constructor() {
        super(ExtraService);
    }

    async getServicesByType(serviceType) {
        try {
            const services = await this.findAllWithField('service_type', serviceType);
            return services;
        } catch (error) {
            throw error;
        }
    }

    async getServicesByIds(serviceIds) {
        try {
            const services = await ExtraService.findAll({
                where: {
                    id: serviceIds
                }
            });
            return services;
        } catch (error) {
            throw error;
        }
    }

    async getAllAvailableServices() {
        try {
            const services = await this.getAll();
            return services;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ExtraServiceRepository;