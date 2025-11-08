const { StatusCodes } = require('http-status-codes');
const { UserService } = require('../services');
const { UserRepository, SessionRepository } = require('../repositories');

const userService = new UserService({
    userRepo: new UserRepository(),
    sessionRepo: new SessionRepository()
});

async function signUp(req, res) {
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


async function signIn(req, res) {
    try {
        const { accessToken, refreshToken } = await userService.signIn(req.body);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res
            .status(StatusCodes.OK)
            .json({ accessToken });
    } catch (error) {
        console.error('Error sign in :', error);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: 'Internal Server Error' });
    }
};


async function signOut(req, res) {
    try {
        const refreshToken = req.cookies?.refreshToken;
        await userService.signOut(refreshToken);
        res.clearCookie('refreshToken');
        return res
            .status(StatusCodes.OK);
    } catch (error) {
        console.error('Error sign out :', error);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    signUp,
    signIn,
    signOut
};
