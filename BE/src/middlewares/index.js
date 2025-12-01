

module.exports = {
    ProtectedRoutes : require('./auth-middleware'),
    ErrorHandler : require('./errHandler-middleware'),
    AuthMiddleware: require('./auth-middleware')
    // rbac: require('./rbac-middleware')
};