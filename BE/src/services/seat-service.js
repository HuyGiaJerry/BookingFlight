const {SeatRepository} = require('../repositories'); 
const {StatusCodes} = require('http-status-codes');
const {AppError} = require('../utils/errors/app-error');


class SeatService {
    constructor() {
        this.seatRepository = new SeatRepository();
    }

    async createSeat(data) {
        try {
            const seat = await this.seatRepository.create(data);
            return seat;
        } catch (error) {
            
        }
    }


}

module.exports = SeatService;