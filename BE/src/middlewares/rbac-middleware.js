const { UserRepository } = require('../repositories');
const { StatusCodes } = require('http-status-codes');
const {Responses} = require('../utils/common');

const authorize = (requiredPermissions = []) => {
  if (typeof requiredPermissions === 'string') requiredPermissions = [requiredPermissions];

  return async (req, res, next) => {
      console.log('[RBAC] req.userId=', req, 'requiredPermissions=', requiredPermissions);
    try {
      const userId = req.user.id;
      if (!userId) return res.status(StatusCodes.UNAUTHORIZED).json(Responses.ErrorResponse("Cannot found user ID","UNAUTHORIZED", StatusCodes.UNAUTHORIZED));

      const user = await new UserRepository().getWithRoleAndPermissions(userId);
      console.log('[RBAC] fetched user:', user ? { id: user.id, role: user.role && user.role.title } : null);
      if (!user) return res.status(StatusCodes.UNAUTHORIZED).json(Responses.ErrorResponse("Unauthorized user","UNAUTHORIZED", StatusCodes.UNAUTHORIZED));
      const rolePerms = Array.isArray(user.role?.rolePermissions) ? user.role.rolePermissions.map(p => p.permission) : [];
      console.log('[RBAC] rolePerms=', rolePerms);

      if (requiredPermissions.length > 0) {
        const hasAll = requiredPermissions.every(p => rolePerms.includes(p));
        if (!hasAll) return res.status(StatusCodes.FORBIDDEN).json(Responses.ErrorResponse("Forbidden: insufficient permissions","FORBIDDEN", StatusCodes.FORBIDDEN));
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('RBAC error:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(Responses.ErrorResponse("Internal Server Error","INTERNAL_SERVER_ERROR", StatusCodes.INTERNAL_SERVER_ERROR));
    }
  };
};


module.exports = { authorize };