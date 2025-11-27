const { Role } = require('../models');
const PROTECTED_ROLES = require('../constants/protectedRoles');

const protectSystemRoles = async (req, res, next) => {
  try {
    const roleId = req.params.id || req.body.id;
    if (!roleId) return next();

    const role = await Role.findByPk(roleId);
    if (role && PROTECTED_ROLES.includes(role.title)) {
      return res.status(403).json({
        success: false,
        message: `Không được thao tác với role hệ thống: ${role.title}`
      });
    }
    
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = protectSystemRoles;