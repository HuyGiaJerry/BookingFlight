const axios = require('axios');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');

class OAuthService {
    static async getGoogleTokens(code) {
        try {
            const params = new URLSearchParams();
            params.append('code', code);
            params.append('client_id', process.env.GOOGLE_CLIENT_ID);
            params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
            params.append('redirect_uri', process.env.GOOGLE_REDIRECT_URI);
            params.append('grant_type', 'authorization_code');

            const response = await axios.post('https://oauth2.googleapis.com/token', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error getting Google tokens:', error);
            throw new AppError('Failed to get Google tokens', StatusCodes.INTERNAL_SERVER_ERROR);
        }

    }


    static async getUserInfo(id_token, access_token) {
        try {
            // verify & get user info
            const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting user info:', error);
            throw new AppError('Failed to get user info', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = OAuthService;