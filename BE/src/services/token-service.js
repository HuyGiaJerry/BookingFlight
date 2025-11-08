const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_KEY_TTL = process.env.ACCESS_KEY_TTL; // 1 hour
const REFRESH_KEY_TTL = process.env.REFRESH_KEY_TTL; // 7 days in milliseconds
const ACCESS_KEY_SECRET = process.env.ACCESS_KEY_SECRET;
class TokenService {
    static createAccessToken(payload) {
        try {
            return jwt.sign(payload, ACCESS_KEY_SECRET, { expiresIn: ACCESS_KEY_TTL });
        } catch (error) {
            console.error('Error creating access token:', error);
            throw error;
        }
    }

    static createRefreshToken() {
        try {
            return crypto.randomBytes(64).toString('hex');
        } catch (error) {
            console.error('Error creating refresh token:', error);
            throw error;
        }
    }

    static verifyAccessToken(token) {
        try {
            return jwt.verify(token, process.env.ACCESS_KEY_SECRET);
        } catch (error) {
            console.error('Error verifying access token:', error);
            throw error;
        }
    }

    static getRefreshTokenTTL() {
        return REFRESH_KEY_TTL;
    }

}

module.exports = TokenService;