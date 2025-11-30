const { StatusCodes } = require('http-status-codes');
const { UserService, TokenService } = require('../services');
const { UserRepository, SessionRepository } = require('../repositories');
const { Session } = require('../models')
const resendProvider = require('../providers/resendProvider');
const otpService = require('../services/otpService');
const responses = require('../utils/common/responses');

const userService = new UserService({
    userRepo: new UserRepository(),
    sessionRepo: new SessionRepository()
});

async function signUp(req, res, next) {
    console.log('req.body:', req.body)
    try {
        const user = await userService.signUp(req.body);

        console.log('user:', user)

        const to = user.email
        const subject = 'Create account successfully - Trevoloka!'
        const html = `<h1>Welcome to Trevoloka</h1><p>Your account has been created successfully.</p><p>Username: ${user.fullname}</p>`

        const sentEmailResponse = await resendProvider.sendEmail(to, subject, html)
        console.log('sentEmailResponse:', sentEmailResponse)
        return res
            .status(StatusCodes.CREATED)
            .json(responses.SuccessResponse(user));
    } catch (error) {
        next(error);
    }
};

async function signIn(req, res, next) {
    try {
        console.log('req body:', req.body)
        const { email, password } = req.body;

        // Check email/password
        const user = await userService.signIn({ email, password });

        if (!user) {
            return res
                .status(StatusCodes.UNAUTHORIZED)
                .json(responses.ErrorResponse('Email hoặc mật khẩu không đúng.'));
        }

        const { captchaToken } = req.body;
        console.log('Captcha Token:', captchaToken);

        if (!captchaToken) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ error: 'Captcha missing' });
        }

        const data = await userService.verifyCaptcha(captchaToken);

        if (!data.success) {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(responses.ErrorResponse('Captcha invalid'));
        }

        console.log('user:', user)
        // generate otp
        const otp = otpService.generateOTP();

        // save otp redis
        await otpService.saveOTP(req.body.email, otp);

        // send otp to email
        const to = req.body.email
        const subject = 'Verify your email - Trevoloka!'
        const html = `<h1>Verify your email</h1><p>Your OTP is: ${otp}</p>
        <p>OTP will expire in 5 minutes</p>`

        const sentEmailResponse = await resendProvider.sendEmail(to, subject, html)
        console.log('sentEmailResponse:', sentEmailResponse)

        return res.status(StatusCodes.OK).json(responses.SuccessResponse({
            message: 'OTP sent email',
            email: req.body.email
        }));

    } catch (error) {
        next(error);
    }
};


async function signOut(req, res, next) {
    try {
        const refreshToken = req.cookies?.refreshToken;
        await userService.signOut({ refreshToken });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        return res
            .status(StatusCodes.OK)
            .json(responses.SuccessResponse({ message: 'Signed out successfully' }));
    } catch (error) {
        next(error);
    }
}

async function refreshToken(req, res) {
    try {
        const oldToken = req.cookies?.refreshToken;

        if (!oldToken) return res.status(401).json({ message: 'Không có refresh token' });

        const session = await Session.findValidByRefreshToken(oldToken);

        if (!session) {
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            });
            return res.status(403).json({
                message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
            });
        }

        const userId = session.account_id;
        const accessToken = TokenService.createAccessToken({ userId })
        return res.status(200).json({ accessToken });
    } catch (error) {
        next(error);
    }
}

async function verifyOtp(req, res, next) {
    try {
        console.log("Verify Body:", req.body)

        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json(responses.ErrorResponse('Missing email or otp'));
        }

        const isValid = await otpService.verifyOTP(email, otp);
        if (!isValid) {
            return res.status(400).json({ message: 'OTP không hợp lệ' });
        }

        // Xoá OTP
        await otpService.deleteOTP(email);

        // find user
        const user = await userService.findByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const accessToken = TokenService.createAccessToken({ userId: user.id });
        const refreshToken = TokenService.createRefreshToken();
        const expiresAt = new Date(Date.now() + TokenService.getRefreshTokenTTL());

        // Lưu refresh token vào DB (session)
        await new SessionRepository().create({
            refresh_token: refreshToken,
            expire_at: expiresAt,
            account_id: user.id
        });

        // Set refreshToken cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, // false : bắt buộc dùng HTTPS
            sameSite: "none", 
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });
        // res.cookie('refreshToken', refreshToken, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production',
        //     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        //     maxAge: 7 * 24 * 60 * 60 * 1000,
        // });

        // Return access token
        return res.status(StatusCodes.OK).json(responses.SuccessResponse({
            accessToken
        }));

    } catch (error) {
        next(error);
    }
}

// ✅ CHỨC NĂNG: Lấy thông tin chi tiết account + role + permissions
// REQUEST: GET /api/v1/auth/account-details
// HEADER: Authorization: Bearer <token>
// RESPONSE: Account info + role + permissions
async function getAccountDetails(req, res, next) {
    try {
        // Lấy token từ header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(StatusCodes.UNAUTHORIZED).json(
                responses.ErrorResponse('Authorization header is required')
            );
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

        // Gọi service để lấy account details
        const accountDetails = await userService.getAccountDetailsWithRolePermissions(token);

        return res.status(StatusCodes.OK).json(
            responses.SuccessResponse(accountDetails)
        );

    } catch (error) {
        console.error('Error getting account details:', error);
        next(error);
    }
}

// ✅ CHỨC NĂNG: Lấy profile user (thông tin cơ bản)
// REQUEST: GET /api/v1/auth/profile
// HEADER: Authorization: Bearer <token>
// RESPONSE: Basic profile info
async function getUserProfile(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(StatusCodes.UNAUTHORIZED).json(
                responses.ErrorResponse('Authorization header is required')
            );
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        const profile = await userService.getUserProfile(token);

        return res.status(StatusCodes.OK).json(
            responses.SuccessResponse(profile)
        );

    } catch (error) {
        next(error);
    }
}

// ✅ CHỨC NĂNG: Kiểm tra permission của user
// REQUEST: POST /api/v1/auth/check-permission
// HEADER: Authorization: Bearer <token>
// BODY: {"permission": "read_users"}
// RESPONSE: {hasPermission: true/false, userRole, permissions[]}
async function checkPermission(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const { permission } = req.body;

        if (!authHeader) {
            return res.status(StatusCodes.UNAUTHORIZED).json(
                responses.ErrorResponse('Authorization header is required')
            );
        }

        if (!permission) {
            return res.status(StatusCodes.BAD_REQUEST).json(
                responses.ErrorResponse('Permission is required')
            );
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        const result = await userService.checkUserPermission(token, permission);

        return res.status(StatusCodes.OK).json(
            responses.SuccessResponse(result)
        );

    } catch (error) {
        next(error);
    }
}


module.exports = {
    signUp,
    signIn,
    signOut,
    refreshToken,
    verifyOtp,
    // ✅ NEW
    getAccountDetails,
    getUserProfile,
    checkPermission
};
