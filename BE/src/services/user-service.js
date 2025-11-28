const { UserRepository, SessionRepository } = require('../repositories');
const bcrypt = require('bcrypt');
const TokenService = require('./token-service');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const { axios } = require('axios');

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

            const { phone_number, password  } = data;
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

    async verifyCaptcha(token) {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;

        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            {
                params: {
                    secret: secret,
                    response: token,
                },
            }
        );
        return response.data.success;
    }



}
module.exports = UserService;