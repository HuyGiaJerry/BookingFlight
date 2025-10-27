const CrudRepository = require('./crud-repository');
const {User} = require('../models');

class UserRepository extends CrudRepository {
    constructor() {
        super(User);
    }
    
    // write user-specific raw database queries below

}

module.exports = UserRepository;