const express = require('express');
const router = express.Router();
const {RoleController} = require('../../controllers');
// const auth = require('../../middlewares/auth-middleware');
const { authorize } = require('../../middlewares/rbac-middleware');
// const { ProtectedRoutes } = require('../../middlewares/auth-middleware');

// router.use(ProtectedRoutes);

const {authenticateToken} = require('../../middlewares/auth-middleware');

router.use(authenticateToken);

router.get('/all', authorize('role.admin'), RoleController.getAllRoleAndPermissions);

router.put('/:id', authorize('role.admin'), RoleController.updateRolePermission);


router.get('/', authorize('role.admin'), RoleController.getAll);
// router.get('/:id', authorize('role.admin'), RoleController.getById);
router.post('/', authorize('role.admin'), RoleController.create);
// router.delete('/:id', authorize('role.admin'), RoleController.remove);

module.exports = router;