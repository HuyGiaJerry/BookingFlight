const CrudRepository = require('./crud-repository');
const {Session} = require('../models');
const { where } = require('sequelize');

class SessionRepository extends CrudRepository {
    constructor() {
        super(Session);
    }
    
    // write user-specific raw database queries below
    async deleteByRefreshToken(refreshToken) {
        try {
            await this.model.destroy({
                where: {
                    refresh_token: refreshToken
                }
            });
        } catch (error) {
            console.error('Error deleting session by refresh token:', error);
        }
    }

}

module.exports = SessionRepository;