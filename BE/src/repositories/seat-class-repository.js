const Crud = require('./crud-repository');
const {SeatClass} = require('../models');

class SeatClassRepository extends Crud {
    constructor() {
        super(SeatClass);
    }

}

module.exports = SeatClassRepository;