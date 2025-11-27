const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/role-controller');
const auth = require('../../middlewares/auth-middleware');
const { authorize } = require('../../middlewares/rbac-middleware');

router.get('/', auth, authorize('role.manage'), roleController.getAll);
router.get('/:id', auth, authorize('role.manage'), roleController.getById);
router.post('/', auth, authorize('role.manage'), roleController.create);
router.put('/:id', auth, authorize('role.manage'), roleController.update);
router.delete('/:id', auth, authorize('role.manage'), roleController.remove);

module.exports = router;