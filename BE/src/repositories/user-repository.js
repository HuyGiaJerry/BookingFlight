const CrudRepository = require('./crud-repository');
const {User} = require('../models');
const { where } = require('sequelize');

class UserRepository extends CrudRepository {
    constructor() {
        super(User);
    }
    
    // write user-specific raw database queries below
    async findByPhoneNumber(phone_number) {
        try {
            const user = await this.model.findOne({
                where: { phone_number: phone_number }
            })
            return user;
        } catch (error) {
            console.error("Error in CRUD (findByPhone):", error);
            throw error;
        }
    }

}

module.exports = UserRepository;