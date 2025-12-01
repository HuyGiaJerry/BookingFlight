const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
const { UserService } = require('../services');
const { UserRepository, SessionRepository } = require('../repositories');
const responses = require('../utils/common/responses');
const e = require('express');

const userService = new UserService({
    userRepo: new UserRepository(),
    sessionRepo: new SessionRepository()
});

// ✅ MIDDLEWARE CŨ: Fixed version
const protectedRoutes = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
        }

        jwt.verify(token, process.env.ACCESS_KEY_SECRET, async (err, decodedUser) => {
            if (err) {
                return res.status(StatusCodes.FORBIDDEN).json({ error: 'Forbidden' });
            }

            console.log('decodedUser.userId: ', decodedUser.userId);

            // ✅ FIX: Use existing service method
            const existingUser = await userService.getAccountById(decodedUser.userId);

            if (!existingUser) {
                return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
            }

            console.log('existingUser.role: ', existingUser);

            // ✅ FIX: Use correct repository method
            const userRepo = new UserRepository();
            const user = await userRepo.getWithRoleAndPermissions(existingUser.id);
            console.log('user.role: ', user);

            if (user.role.title === 'Customer') {
                return res.status(403).json({
                    message: "Forbidden: Customers cannot access admin routes"
                });
            }

            console.log("Auth account: ", existingUser);
            req.user = existingUser;
            console.log('Req user: ', req.user);
            next();
        });

    } catch (error) {
        console.error('Error in auth middleware:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
};

// ✅ MIDDLEWARE MỚI: Verify token và attach user data
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(StatusCodes.UNAUTHORIZED).json(
                responses.ErrorResponse('Authorization header is required')
            );
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        console.log('Token:', token);
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.ACCESS_KEY_SECRET);
        } catch (err) {
            return res.status(StatusCodes.UNAUTHORIZED).json(
                responses.ErrorResponse('Invalid or expired token', 'Invalid or expired token', StatusCodes.UNAUTHORIZED)
            );
        }
        // ✅ Lấy user details và attach vào request
        const accountDetails = await userService.getAccountDetailsWithRolePermissions(token);
        req.user = accountDetails;

        next();
    } catch (error) {
        console.error('Authentication middleware error:', error);

        const statusCode = error.statusCode || StatusCodes.UNAUTHORIZED;
        return res.status(statusCode).json(
            responses.ErrorResponse(error.message, error.message || 'Authentication failed', statusCode)
        );
    }
};

// ✅ MIDDLEWARE MỚI: Kiểm tra permission cụ thể
const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(StatusCodes.UNAUTHORIZED).json(
                    responses.ErrorResponse('User not authenticated')
                );
            }

            const hasPermission = req.user.role.permissions.includes(permission);

            if (!hasPermission) {
                return res.status(StatusCodes.FORBIDDEN).json(
                    responses.ErrorResponse(`Permission '${permission}' required`)
                );
            }

            next();
        } catch (error) {
            console.error('Permission middleware error:', error);
            return res.status(StatusCodes.FORBIDDEN).json(
                responses.ErrorResponse('Permission check failed')
            );
        }
    };
};

// ✅ MIDDLEWARE MỚI: Kiểm tra role admin
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(StatusCodes.UNAUTHORIZED).json(
                responses.ErrorResponse('User not authenticated')
            );
        }

        if (req.user.role.title !== 'admin') {
            return res.status(StatusCodes.FORBIDDEN).json(
                responses.ErrorResponse('Admin access required')
            );
        }

        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(StatusCodes.FORBIDDEN).json(
            responses.ErrorResponse('Admin check failed')
        );
    }
};

// ✅ MIDDLEWARE MỚI: Cho phép Customer access
const allowCustomer = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(StatusCodes.UNAUTHORIZED).json(
                responses.ErrorResponse('Authorization header is required')
            );
        }

        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
        const accountDetails = await userService.getAccountDetailsWithRolePermissions(token);
        req.user = accountDetails;

        next();
    } catch (error) {
        console.error('Customer auth middleware error:', error);

        const statusCode = error.statusCode || StatusCodes.UNAUTHORIZED;
        return res.status(statusCode).json(
            responses.ErrorResponse(error.message || 'Authentication failed')
        );
    }
};

module.exports = {
    protectedRoutes,     // ✅ Middleware cũ - fixed
    authenticateToken,   // ✅ Middleware mới - verify token
    requirePermission,   // ✅ Middleware mới - check permission
    requireAdmin,        // ✅ Middleware mới - check admin role
    allowCustomer,       // ✅ Middleware mới - cho customer
    ProtectedRoutes: protectedRoutes // ✅ Alias để tương thích với code hiện tại
};
