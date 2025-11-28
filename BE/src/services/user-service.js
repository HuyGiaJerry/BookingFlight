const { UserRepository, SessionRepository } = require('../repositories');
const bcrypt = require('bcrypt');
const TokenService = require('./token-service');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const axios = require('axios');

class UserService {
    constructor({ userRepo, sessionRepo }) {
        this.userRepository = userRepo || new UserRepository();
        this.sessionRepository = sessionRepo || new SessionRepository();
    }

    async signUp(data, options = {}) {
        try {
            const { fullname, phone_number, password, address } = data;

            if (!fullname || !phone_number || !password || !address) {
                throw new Error('Thiếu thông tin đăng ký !');
            }
            // Kiểm tra user tồn tại chưa 
            const duplicate = await this.userRepository.findByPhoneNumber(phone_number);
            if (duplicate) {
                throw new Error('User đã tồn tại !');
            }

            // Mã hóa mật khẩu
            const hashedPassword = await bcrypt.hash(password, 10); // salt = 10

            // Tạo user mới
            await this.userRepository.create({
                fullname: fullname,
                phone: phone_number,
                password: hashedPassword,
                address: address,
                google_id: 0,
                facebook_id: 0,
                is_active: 1
            })
            return;
        } catch (error) {
            throw error;
        }
    }


    async signIn(data, options = {}) {
        try {

            const { phone_number, password } = data;
            if (!phone_number || !password) {
                throw new Error('Thiếu thông tin đăng nhập !');
            }

            // so sánh hashed pass với pass input
            const user = await this.userRepository.findByPhoneNumber(phone_number);
            if (!user) {
                throw new Error('User or password không đúng !');
            }
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                throw new Error('User or password không đúng !');
            }
            // nếu khớp tạo access token
            const accessToken = TokenService.createAccessToken({ userId: user.id });
            // tạo refresh token
            const refreshToken = TokenService.createRefreshToken();
            const expiresAt = new Date(Date.now() + TokenService.getRefreshTokenTTL())
            // tạo session mới lưu refresh token 
            await this.sessionRepository.create({
                refresh_token: refreshToken,
                expire_at: expiresAt,
                account_id: user.id
            })
            return { accessToken, refreshToken };

        } catch (error) {
            throw error;
        }
    }

    async signOut(data, options = {}) {
        console.log('data: ', data)
        try {
            // Lấy refresh token từ data(cookie)
            const { refreshToken } = data;
            if (!refreshToken) {
                throw new Error('Thiếu thông tin đăng xuất !');
            }
            // Xóa refresh token (session) khỏi database
            await this.sessionRepository.deleteByRefreshToken(refreshToken);
            // Xóa cookie trên trình duyệt
            return;
        } catch (error) {
            throw error;
        }
    }

    async getUserById(userId) {
        try {
            return await this.userRepository.findOneWithAttributes('id', userId, { exclude: ['password'] });
        } catch (error) {
            throw error;
        }
    }

    async findByGoogleId(google_id) {
        try {
            return await this.userRepository.findOneWithAttributes('google_id', google_id, { exclude: ['password'] });
        } catch (error) {
            throw error;
        }
    }

    async findByEmail(email) {
        try {
            return await this.userRepository.findOneWithAttributes('email', email, { exclude: ['password'] });
        } catch (error) {
            throw new AppError('Internal Server Error', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }


    async updateUser(id, data) {
        try {
            const updateUser = this.userRepository.get(id);
            if (!updateUser) throw new AppError('User không tồn tại !', StatusCodes.NOT_FOUND);
            return await this.userRepository.update(id, data);
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Internal Server Error', StatusCodfes.INTERNAL_SERVER_ERROR);
        }
    }

    async createUser(data) {
        try {
            const { fullname, email, google_id, logo_url } = data;

            const newUser = await this.userRepository.create({
                fullname,
                email,
                google_id,
                facebook_id: 0,
                is_active: 1,
                logo_url
            });
            return newUser;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Internal Server Error', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async saveRefreshToken(data) {
        try {
            await this.sessionRepository.deleteByUserId(data.user_id);
            return await this.sessionRepository.create(data);
        } catch (error) {
            console.error('Error saving refresh token:', error);
            throw new AppError('Failed to save refresh token', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    // async verifyCaptcha(token) {
    //     try {
    //         // ✅ BYPASS: Skip in development
    //         if (process.env.NODE_ENV === 'development') {
    //             console.log('🚨 CAPTCHA BYPASSED - Development Mode');
    //             console.log('- Environment:', process.env.NODE_ENV);
    //             console.log('- Token received:', !!token);
    //             return true; // ✅ Always return true in development
    //         }

    //         // ✅ PRODUCTION: Normal captcha verification
    //         const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    //         console.log('🔍 CAPTCHA DEBUG START:');
    //         console.log('- Environment:', process.env.NODE_ENV);
    //         console.log('- Secret Key exists:', !!secretKey);
    //         console.log('- Secret Key value:', secretKey);
    //         console.log('- Token exists:', !!token);
    //         console.log('- Token length:', token ? token.length : 0);
    //         console.log('- Token preview:', token ? token.substring(0, 50) + '...' : 'N/A');

    //         if (!secretKey) {
    //             console.error('❌ RECAPTCHA_SECRET_KEY missing from environment');
    //             return false;
    //         }

    //         if (!token) {
    //             console.error('❌ Captcha token is missing');
    //             return false;
    //         }

    //         const params = new URLSearchParams();
    //         params.append('secret', secretKey);
    //         params.append('response', token);

    //         console.log('📤 Request to Google:');
    //         console.log('- URL: https://www.google.com/recaptcha/api/siteverify');
    //         console.log('- Params:', params.toString());

    //         const response = await axios.post(
    //             'https://www.google.com/recaptcha/api/siteverify',
    //             params,
    //             {
    //                 headers: {
    //                     'Content-Type': 'application/x-www-form-urlencoded',
    //                 },
    //                 timeout: 10000
    //             }
    //         );

    //         console.log('📥 Google Response:');
    //         console.log('- Status:', response.status);
    //         console.log('- Data:', JSON.stringify(response.data, null, 2));

    //         if (response.data.success) {
    //             console.log('✅ Captcha verification SUCCESS');
    //             return true;
    //         } else {
    //             console.log('❌ Captcha verification FAILED');
    //             console.log('- Error codes:', response.data['error-codes']);

    //             // ✅ Explain error codes
    //             const errorCodes = response.data['error-codes'];
    //             if (errorCodes.includes('timeout-or-duplicate')) {
    //                 console.log('- Issue: Token already used or expired (need fresh token)');
    //             } else if (errorCodes.includes('invalid-input-response')) {
    //                 console.log('- Issue: Invalid token format');
    //             }

    //             return false;
    //         }

    //     } catch (error) {
    //         console.error('❌ Exception during captcha verification:');
    //         console.error('- Error message:', error.message);
    //         console.error('- Error details:', error.response?.data || 'No response data');
    //         return false;
    //     }
    // }



}
module.exports = UserService;