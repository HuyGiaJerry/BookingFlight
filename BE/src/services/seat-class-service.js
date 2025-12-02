const {SeatClassRepository} = require('../repositories');

class SeatClassService {
    constructor() {
        this.seatClassRepository = new SeatClassRepository();
    }

    async createSeatClass(seatClassData) {
        return await this.seatClassRepository.create(seatClassData);
    }
    async getSeatClassById(seatClassId) {
        return await this.seatClassRepository.get(seatClassId);
    }
    async getAllSeatClasses() {
        return await this.seatClassRepository.getAll();
    }
    async updateSeatClass(seatClassId, seatClassData) {
        return await this.seatClassRepository.update(seatClassId, seatClassData);
    }
    async deleteSeatClass(seatClassId) {
        return await this.seatClassRepository.destroy(seatClassId);
    }
}

module.exports = SeatClassService;