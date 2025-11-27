

module.exports = {
    ProtectedRoutes : require('./auth-middleware'),
    ErrorHandler : require('./errHandler-middleware')
    // rbac: require('./rbac-middleware')
};