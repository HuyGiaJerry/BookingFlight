const { UserRepository, SessionRepository } = require('../repositories');
const bcrypt = require('bcrypt');
const TokenService = require('./token-service');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const axios = require('axios');
const { Account, Role, RolePermission } = require('../models');

class UserService {
    constructor({ userRepo, sessionRepo }) {
        this.userRepository = userRepo;
        this.sessionRepository = sessionRepo;
    }

    // ✅ CHỨC NĂNG: Lấy thông tin account + role + permissions từ token
    // INPUT: token (JWT string)
    // OUTPUT: Object chứa account info + role + permissions
    async getAccountDetailsWithRolePermissions(token) {
        try {
            // Step 1: Verify and decode token
            if (!token) {
                throw new AppError('Access token is required', StatusCodes.UNAUTHORIZED);
            }

            // Remove 'Bearer ' prefix if present
            const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

            let decoded;
            try {
                decoded = TokenService.verifyAccessToken(cleanToken);
            } catch (error) {
                throw new AppError('Invalid or expired token', StatusCodes.UNAUTHORIZED);
            }

            const userId = decoded.userId;
            if (!userId) {
                throw new AppError('Invalid token payload', StatusCodes.UNAUTHORIZED);
            }

            // Step 2: Get account with role and permissions từ database
            const account = await Account.findOne({
                where: {
                    id: userId
                    // deleted: false // Chỉ lấy account active
                },
                attributes: ['id', 'fullname', 'email', 'phone', 'avatar', 'status'],
                include: [
                    {
                        model: Role,
                        as: 'role',
                        include: [
                            {
                                model: RolePermission,
                                as: 'rolePermissions',
                                attributes: ['permission']
                            }
                        ]
                    }
                ],
                attributes: {
                    exclude: ['password'] // Không trả về password
                }
            });

            if (!account) {
                throw new AppError('Account not found or has been deactivated', StatusCodes.NOT_FOUND);
            }

            // Step 3: Format response data
            const accountDetails = {
                user: {
                    id: account.id,
                    fullname: account.fullname,
                    email: account.email,
                    phone: account.phone,
                    avatar: account.avatar,
                    status: account.status,
                },
                permissions: [account.role?.rolePermissions?.map(rp => rp.permission) || []]
            };

            console.log('✅ Account details retrieved successfully for userId:', userId);
            return accountDetails;

        } catch (error) {
            console.error('❌ Error getting account details with role permissions:', error);

            if (error instanceof AppError) {
                throw error;
            }

            throw new AppError('Failed to retrieve account details', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ CHỨC NĂNG: Lấy account theo ID (dùng nội bộ)
    // INPUT: userId (number)
    // OUTPUT: Account object với role và permissions
    async getAccountById(userId) {
        try {
            const account = await Account.findOne({
                where: {
                    id: userId,
                    deleted: false
                },
                include: [
                    {
                        model: Role,
                        as: 'role',
                        include: [
                            {
                                model: RolePermission,
                                as: 'rolePermissions'
                            }
                        ]
                    }
                ],
                attributes: {
                    exclude: ['password']
                }
            });

            return account;
        } catch (error) {
            console.error('Error getting account by ID:', error);
            throw error;
        }
    }

    // ✅ CHỨC NĂNG: Kiểm tra user có permission cụ thể không
    // INPUT: token (JWT), requiredPermission (string)
    // OUTPUT: Object {hasPermission: boolean, userRole: string, permissions: array}
    async checkUserPermission(token, requiredPermission) {
        try {
            const accountDetails = await this.getAccountDetailsWithRolePermissions(token);

            const hasPermission = accountDetails.role.permissions.includes(requiredPermission);

            return {
                hasPermission,
                userRole: accountDetails.role.title,
                permissions: accountDetails.role.permissions
            };
        } catch (error) {
            console.error('Error checking user permission:', error);
            throw error;
        }
    }

    // ✅ CHỨC NĂNG: Lấy profile user (thông tin cơ bản)
    // INPUT: token (JWT)
    // OUTPUT: Object chứa thông tin profile cơ bản
    async getUserProfile(token) {
        try {
            const accountDetails = await this.getAccountDetailsWithRolePermissions(token);

            // Return only essential profile information
            return {
                id: accountDetails.id,
                fullname: accountDetails.fullname,
                email: accountDetails.email,
                phone: accountDetails.phone,
                avatar: accountDetails.avatar,
                status: accountDetails.status,
                role: accountDetails.role.title
            };
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }

    // async signUp(data, options = {}) {
    //     try {
    //         const { fullname, phone_number, password, address } = data;

    //         if (!fullname || !phone_number || !password || !address) {
    //             throw new Error('Thiếu thông tin đăng ký !');
    //         }
    //         // Kiểm tra user tồn tại chưa 
    //         const duplicate = await this.userRepository.findByPhoneNumber(phone_number);
    //         if (duplicate) {
    //             throw new Error('User đã tồn tại !');
    //         }

    //         // Mã hóa mật khẩu
    //         const hashedPassword = await bcrypt.hash(password, 10); // salt = 10

    //         // Tạo user mới
    //         await this.userRepository.create({
    //             fullname: fullname,
    //             phone: phone_number,
    //             password: hashedPassword,
    //             address: address,
    //             google_id: 0,
    //             facebook_id: 0,
    //             is_active: 1
    //         })
    //         return;
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    async signUp(data, options = {}) {
        try {
            const { fullname, email, password, address } = data;

            // if (!fullname || !email || !password || !address) {
            //     throw new Error('Thiếu thông tin đăng ký !');
            // }
            // Kiểm tra user tồn tại chưa 
            // const duplicate = await this.userRepository.findByEmail(email);
            // if (duplicate) {
            //     throw new Error('User đã tồn tại !');
            // }

            // Mã hóa mật khẩu
            const hashedPassword = await bcrypt.hash(password, 10);

            // Tạo user mới
            const newUser = await this.userRepository.create({
                fullname: fullname,
                email: email,
                password: hashedPassword,
                address: address,
                google_id: 0,
                facebook_id: 0,
                role_id: 4, // default role customer when register
                is_active: 1
            })
            return {
                email: newUser.email,
                fullname: newUser.fullname
            }
        } catch (error) {
            throw error;
        }
    }

    async signIn(data, options = {}) {
        try {
            const { email, password } = data;
            if (!email || !password) {
                throw new Error('Thiếu thông tin đăng nhập !');
            }

            // so sánh hashed pass với pass input
            const user = await this.userRepository.findWithPassword(email);
            if (!user) {
                throw new Error('User or password không đúng !');
            }
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return null;
            }

            console.log(' service user: ', user)
            return user;

        } catch (error) {
            throw error;
        }
    }

    async signOut(data, options = {}) {
        try {
            const { refreshToken } = data;
            if (!refreshToken) {
                throw new Error('Thiếu thông tin đăng xuất !');
            }
            // Xóa refresh token (session) khỏi database
            await this.sessionRepository.deleteByRefreshToken(refreshToken);
            return;
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


    // verify captcha
    async verifyCaptcha(captchaToken) {
        try {
            const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";

            const r = await fetch(verifyUrl, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`
            });

            const data = await r.json();
            console.log("Captcha verification:", data);
            return data;
        } catch (error) {
            throw new AppError('Captcha verification failed', StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async getUserById(userId) {
        try {
            return await this.userRepository.get(userId);
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    }
}

module.exports = UserService;