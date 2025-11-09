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

    async deleteByUserId(userId) {
        try {
            return await this.model.destroy({
                where: {
                    user_id: userId
                }
            });
        } catch (error) {
            console.error('Error deleting session by user ID:', error);
            throw error;
        }
    }

    async saveRefreshToken(data) {
        try {
            const { user_id, refresh_token, expires_at } = data;
            return await this.model.create({
                user_id,
                refresh_token,
                expires_at
            });
        } catch (error) {
            console.error('Error saving refresh token:', error);
            throw error;
        }
    }

}

module.exports = SessionRepository;