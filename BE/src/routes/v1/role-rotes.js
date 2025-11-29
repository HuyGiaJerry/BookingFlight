const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/role-controller');
// const auth = require('../../middlewares/auth-middleware');
const { authorize } = require('../../middlewares/rbac-middleware');
const { ProtectedRoutes } = require('../../middlewares');

router.use(ProtectedRoutes);

router.get('/all', authorize('role.admin'), roleController.getAllRoleAndPermissions);

router.put('/:id', authorize('role.admin'), roleController.updateRolePermission);


router.get('/', authorize('role.admin'), roleController.getAll);
// router.get('/:id', authorize('role.admin'), roleController.getById);
router.post('/', authorize('role.admin'), roleController.create);
// router.delete('/:id', authorize('role.admin'), roleController.remove);

module.exports = router;