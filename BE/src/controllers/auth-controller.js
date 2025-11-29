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

async function signUp(req, res) {
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
        console.error('Error sign up user:', error);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: error.message });
    }
};


async function signIn(req, res) {
    try {
        console.log('req body:', req.body)
        // const { accessToken, refreshToken } = await userService.signIn(req.body);
        // const { captchaToken } = req.body;
        // console.log('Captcha Token:', captchaToken);

        // if (!captchaToken) {
        //     return res
        //         .status(StatusCodes.BAD_REQUEST)
        //         .json({ error: 'Captcha missing' });
        // }

        // const data = await userService.verifyCaptcha(captchaToken);

        // if (!data.success) {
        //     return res
        //         .status(StatusCodes.BAD_REQUEST)
        //         .json({ error: 'Captcha invalid' });
        // }

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

        // res.cookie('refreshToken', refreshToken, {
        //     httpOnly: true,
        //     secure: true,
        //     sameSite: 'none',
        //     maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        // });
        // // Lưu refresh token vào db

        // return res
        //     .status(StatusCodes.OK)
        //     .json({ accessToken });
    } catch (error) {
        console.error('Error sign in :', error);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(responses.ErrorResponse(error));
    }
};

// sync function signIn(req, res) {
//     try {
//         const { captchaToken } = req.body;
//         console.log('Captcha Token:', captchaToken);

//         if (!captchaToken) {
//             return res
//                 .status(StatusCodes.BAD_REQUEST)
//                 .json({ error: 'Captcha missing' });
//         }

//         const data = await userService.verifyCaptcha(captchaToken);

//         if (!data.success) {
//             return res
//                 .status(StatusCodes.BAD_REQUEST)
//                 .json({ error: 'Captcha invalid' });
//         }
//         // =================================

//         // Xử lý login
//         const { accessToken, refreshToken } = await userService.signIn(req.body);

//         res.cookie("refreshToken", refreshToken, {
//             httpOnly: true,
//             secure: true,
//             sameSite: "none",
//             maxAge: 7 * 24 * 60 * 60 * 1000
//         });

//         return res
//             .status(StatusCodes.OK)
//             .json({ accessToken });

//     } catch (error) {
//         console.error("Error sign in:", error);
//         return res
//             .status(StatusCodes.INTERNAL_SERVER_ERROR)
//             .json({ error: 'Internal Server Error' });
//     }
// }


async function signOut(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;
        // ✅ FIXED: Pass object với property name đúng
        await userService.signOut({ refreshToken }); // Thay vì chỉ pass refreshToken

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        });

        return res
            .status(StatusCodes.OK)
            .json(responses.SuccessResponse({ message: 'Signed out successfully' }));
    } catch (error) {
        console.error('Error sign out:', error);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(responses.ErrorResponse(error));
    }
}

async function refreshToken(req, res) {
    try {
        const oldToken = req.cookies?.refreshToken;

        if (!oldToken) return res.status(401).json({ message: 'Không có refresh token' });

        // DÙNG HÀM NÀY → TỰ ĐỘNG XÓA NẾU HẾT HẠN
        // find valid session
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
        console.error('Error refresh access token:', error);
        // res.clearCookie('refreshToken', { 
        //     httpOnly: true, secure: true, sameSite: 'none' 
        // });
        return res.status(403).json(responses.ErrorResponse('phiên đăng nhập không hợp lệ'));
    }
}

async function verifyOtp(req, res) {
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

        // 5. Set refreshToken cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // 6. Return access token
        return res.status(StatusCodes.OK).json(responses.SuccessResponse({

            accessToken
        }));

    } catch (error) {
        console.error('Error verify otp:', error);
        return res.status(500).json(responses.ErrorResponse(error));
    }
}


module.exports = {
    signUp,
    signIn,
    signOut,
    refreshToken,
    verifyOtp
};
