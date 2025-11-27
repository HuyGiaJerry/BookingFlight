const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { UserService } = require('../services');
const { UserRepository, SessionRepository } = require('../repositories');

const userService = new UserService({
    userRepo: new UserRepository(),
    sessionRepo: new SessionRepository()
});


// authorization middleware to protect routes
const protectedRoutes = (req, res, next) => {
    try {
        // Lấy token từ header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
        }
        // xác nhận token hợp lệ 
        jwt.verify(token, process.env.ACCESS_KEY_SECRET, async (err, decodedUser) => {
            if (err) {
                return res.status(StatusCodes.FORBIDDEN).json({ error: 'Forbidden' });
            }
            // tìm user 
            console.log('decodedUser.userId: ', decodedUser.userId)
            const existingUser = await userService.getUserById(decodedUser.userId);

            if (!existingUser) {
                return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
            }
            // trả về user cho req
            console.log("Auth account: ", existingUser)
            req.user = existingUser;
            console.log('Req user: ', req.user)
            next();
        })

    } catch (error) {
        console.error('Error in auth middleware:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
}

module.exports = protectedRoutes
