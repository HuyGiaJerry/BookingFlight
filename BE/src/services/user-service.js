
const { UserRepository,SessionRepository } = require('../repositories');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const ACCESS_KEY_TTL = '1h'; // TTL : TIme To Live
const REFRESH_KEY_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in seconds

class UserService {
    constructor({ userRepo,sessionRepo }) {
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
                phone_number: phone_number,
                password: hashedPassword,
                address: address,
                google_id: 0,
                facebook_id: 0,
                is_active: 1
            })
            return ;
        } catch (error) {
            throw error;
        }
    }


    async signIn(data, options = {}) {
        try {
            
            const {phone_number, password} = data;
            if(!phone_number || !password){
                throw new Error('Thiếu thông tin đăng nhập !');
            }
            // so sánh hashed pass với pass input
            const user = await this.userRepository.findByPhoneNumber(phone_number);
            if(!user){
                throw new Error('User or password không đúng !');
            }
            const passwordMatch = await bcrypt.compare(password, user.password); 
            if(!passwordMatch){
                throw new Error('User or password không đúng !');
            }
            // nếu khớp tạo access token
            const accessToken = jwt.sign(
                {userId: user.id},
                process.env.ACCESS_KEY_SECRET,
                {expiresIn: ACCESS_KEY_TTL}
            )
            // tạo refresh token
            const refreshToken = crypto.randomBytes(64).toString('hex');
            
            // tạo session mới lưu refresh token 
            await this.sessionRepository.create({
                refresh_token: refreshToken,
                expire_at: new Date(Date.now() + REFRESH_KEY_TTL),
                user_id: user.id
            })
            return {accessToken, refreshToken};
            
        } catch (error) {
            throw error;
        }
    }

    async signOut(data, options = {}) {
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

}
module.exports = UserService;