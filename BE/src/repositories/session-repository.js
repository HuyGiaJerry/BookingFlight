const CrudRepository = require('./crud-repository');
const { Session } = require('../models');
const { Op } = require('sequelize');

class SessionRepository extends CrudRepository {
    constructor() {
        super(Session);
    }

    /**
     * Xóa session theo refresh token
     */
    async deleteByRefreshToken(refreshToken) {
        try {
            return await this.model.destroy({
                where: { refresh_token: refreshToken }
            });
        } catch (error) {
            console.error('Error deleting session by refresh token:', error);
            throw error;
        }
    }

    /**
     * Xóa tất cả session theo user_id
     */
    async deleteByUserId(userId) {
        try {
            return await this.model.destroy({
                where: { user_id: userId }
            });
        } catch (error) {
            console.error('Error deleting session by user ID:', error);
            throw error;
        }
    }

    /**
     * Lưu refresh token mới vào DB
     */
    async saveRefreshToken({ user_id, refresh_token, expires_at }) {
        try {
            const expireDate = new Date(expires_at);

            if (isNaN(expireDate.getTime())) {
                throw new Error('Invalid expire_at date');
            }

            return await this.model.create({
                user_id,
                refresh_token,
                expire_at: expireDate
            });
        } catch (error) {
            console.error('Error saving refresh token:', error);
            throw error;
        }
    }

    /**
     * Tìm session hợp lệ (chưa hết hạn)
     */
    async findValidByToken(refreshToken) {
        try {
            const session = await this.model.findOne({
                where: { refresh_token: refreshToken }
            });

            if (!session) return null;

            if (new Date() > session.expire_at) {
                await session.destroy();  // auto cleanup expired
                return null;
            }

            return session;
        } catch (error) {
            console.error('Error finding valid session:', error);
            throw error;
        }
    }

    /**
     * Auto delete all expired session
     */
    async deleteExpired() {
        try {
            return await this.model.destroy({
                where: {
                    expire_at: { [Op.lt]: new Date() }
                }
            });
        } catch (error) {
            console.error('Error deleting expired sessions:', error);
            throw error;
        }
    }
}

module.exports = SessionRepository;
