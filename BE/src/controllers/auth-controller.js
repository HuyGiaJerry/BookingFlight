const { StatusCodes } = require('http-status-codes');
const { UserService, TokenService } = require('../services');
const { UserRepository, SessionRepository } = require('../repositories');
const { Session } = require('../models')

const userService = new UserService({
    userRepo: new UserRepository(),
    sessionRepo: new SessionRepository()
});

async function signUp(req, res) {
    console.log('req.body:', req.body)
    try {
        const user = await userService.signUp(req.body);
        return res
            .status(StatusCodes.CREATED)
            .json(user);
    } catch (error) {
        console.error('Error sign up user:', error);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: 'Internal Server Error' });
    }
};


// async function signIn(req, res) {
//     try {
//         const {captchaToken} = req.body;
//         console.log('Captcha Token:', captchaToken);
//         if (!captchaToken) return res
//             .status(StatusCodes.BAD_REQUEST)
//             .json({ error: 'Captcha missing' });

//         const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

//         const r = await fetch(verifyUrl, {
//             method: 'POST',
//             headers: {},
//             body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`
//         });
//         const data = await r.json();
//         console.log('Captcha verification response:', data);

//         if(!data.success) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Captcha invalid' });


//         const { accessToken, refreshToken } = await userService.signIn(req.body);

//         res.cookie('refreshToken', refreshToken, {
//             httpOnly: true,
//             secure: true,
//             sameSite: 'none',
//             maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
//         });
//         // Lưu refresh token vào db

//         return res
//             .status(StatusCodes.OK)
//             .json({ accessToken });
//     } catch (error) {
//         console.error('Error sign in :', error);
//         return res
//             .status(StatusCodes.INTERNAL_SERVER_ERROR)
//             .json({ error: 'Internal Server Error' });
//     }
// };


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
            .json({ message: 'Signed out successfully' }); // ✅ FIXED: Return JSON
    } catch (error) {
        console.error('Error sign out:', error);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: 'Internal Server Error' });
    }
}

async function refreshToken(req, res) {
    try {
        const oldToken = req.cookies?.refreshToken;

        if (!oldToken) return res.status(401).json({ message: 'Không có refresh token' });

        // DÙNG HÀM NÀY → TỰ ĐỘNG XÓA NẾU HẾT HẠN
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
        return res.status(403).json({
            message: 'Phiên đăng nhập không hợp lệ'
        });
    }
}


async function signIn(req, res) {
    try {
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
                .json({ error: 'Captcha invalid' });
        }
        // =================================

        // Xử lý login
        const { accessToken, refreshToken } = await userService.signIn(req.body);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res
            .status(StatusCodes.OK)
            .json({ accessToken });

    } catch (error) {
        console.error("Error sign in:", error);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    signUp,
    signIn,
    signOut,
    refreshToken
};
