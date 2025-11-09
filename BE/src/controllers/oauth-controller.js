const { OAuthService, TokenService, UserService } = require('../services')
const { StatusCodes } = require('http-status-codes');
const { UserRepository, SessionRepository } = require('../repositories');
const { use } = require('react');


const userService = new UserService({
    userRepo: new UserRepository(),
    sessionRepo: new SessionRepository()
});

async function redirectToGoogleAuth(req, res, next) {
    try {
        const redirect_uri = 'https://accounts.google.com/o/oauth2/v2/auth?' +
            new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI,
                response_type: 'code',
                scope: 'openid email profile',
                access_type: 'offline',
                prompt: 'consent'
            });
        res.redirect(redirect_uri);
    } catch (error) {
        next(error);
    }
}


async function handleGoogleCallback(req, res, next) {
    try {
        const { code } = req.query;

        if (!code) return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Missing code' });

        // 1 Exchange code for tokens
        const { data } = await OAuthService.getGoogleTokens(code);
        const { id_token, access_token } = data;

        // 2 Get user info
        const userInfo = await OAuthService.getUserInfo(id_token, access_token);

        const { sub, name, email, picture } = userInfo;

        // 3 Find or create user in our db
        let user = await userService.findByGoogleId(sub);
        if (!user) user = await userService.findByEmail(email);
        if (!user) {
            user = await userService.createUser({
                fullname: name,
                email: email,
                google_id: sub,
                logo_url: picture
            });
        } else {
            if(!user.google_id) {
                await userService.updateUser(user.id, { google_id: sub });
                user.google_id = sub;
            }
        }

        // 4 Create jwt token
        const accessToken = TokenService.createAccessToken({ userId: user.id, email: user.email, role: user.role });
        const refreshToken = TokenService.createRefreshToken();

        // 5 Redirect or response 
        // op1: redirect fe 
        // res.redirect (`http://localhost:5173/login-success?token=${accessToken}`);
        // set cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Luu refresh token vao db
        await userService.saveRefreshToken({
            user_id: user.id,
            refresh_token: refreshToken,
            expires_at: new Date(Date.now() + TokenService.getRefreshTokenTTL())
        });
        // 6 response
        // op2: response json
        res.status(StatusCodes.OK)
            .json({
                jwt:{
                    accessToken,
                    refreshToken
                },
                user: {
                    id: user.id,
                    fullname: user.fullname,
                    logo_url: user.logo_url,
                }
            });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    redirectToGoogleAuth,
    handleGoogleCallback
}

