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
        const value = process.env.REFRESH_KEY_TTL || '7d';

    // Hỗ trợ: 7d, 7days, 604800000, 7*24*60*60*1000, v.v.
    if (/^\d+$/.test(value)) {
        return parseInt(value); // đã là ms
    }

    const match = value.match(/^(\d+)([d|h|m|s|day|days|hour|hours]?)$/i);
    if (!match) return 7 * 24 * 60 * 60 * 1000;

    const num = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    const multipliers = {
        'd': 24 * 60 * 60 * 1000,
        'day': 24 * 60 * 60 * 1000,
        'days': 24 * 60 * 60 * 1000,
        'h': 60 * 60 * 1000,
        'hour': 60 * 60 * 1000,
        'hours': 60 * 60 * 1000,
        'm': 60 * 1000,
        's': 1000,
    };

    return num * (multipliers[unit] || multipliers['d']);
    }

}

module.exports = TokenService;