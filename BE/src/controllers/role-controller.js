const { StatusCodes } = require('http-status-codes');
const RoleService = require('../services/role-service');
const { Responses } = require('../utils/common');

const roleService = new RoleService();

// GET ALL
async function getAll(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;

    const { items, pagination } = await roleService.list({ limit, page });
    console.log("row controller: ", items)
    console.log("count controller: ", pagination)
    return res
      .status(StatusCodes.OK)
      .json(Responses.PaginationResponse(items, pagination, "Roles fetched successfully"));
  } catch (error) {
    next(error);
  }
}

// GET ALL ROLE AND PERMISSION
async function getAllRoleAndPermissions(req, res, next) {
  try {
    const roles = await roleService.getAllRoleAndPermission();
    return res
      .status(StatusCodes.OK)
      .json(Responses.SuccessResponse(roles, "Roles fetched successfully"));
  } catch (error) {
    next(error);
  }
}

// GET BY ID
async function getById(req, res, next) {
  try {
    const role = await roleService.getById(req.params.id);
    return res
      .status(StatusCodes.OK)
      .json(Responses.SuccessResponse(role, "Role fetched successfully"));
  } catch (error) {
    next(error);
  }
}

// CREATE
async function create(req, res, next) {
  try {
    const created = await roleService.create(req.body);
    return res
      .status(StatusCodes.CREATED)
      .json(Responses.SuccessResponse(created, "Role created successfully"));
  } catch (error) {
    next(error);
  }
}

// UPDATE
async function update(req, res, next) {
  try {
    // const updated = await roleService.update(req.params.id, req.body);
    // return res
    //   .status(StatusCodes.OK)
    //   .json(Responses.SuccessResponse(updated, "Role updated successfully"));
  } catch (error) {
    next(error);
  }
}

// DELETE (soft delete)
async function remove(req, res, next) {
  try {
    await roleService.softDelete(req.params.id);
    return res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
}
async function updateRolePermission(req, res, next) {
  try {
    const roleId = req.params.id;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(StatusCodes.BAD_REQUEST)
        .json(Responses.ErrorResponse("permissions must be array"));
    }

    console.log("roleId: ", roleId)
    console.log("permissions: ", permissions)
    const updated = await roleService.updateRolePermission(roleId, permissions);

    return res.status(StatusCodes.OK)
      .json(Responses.SuccessResponse(updated, "Permissions updated successfully"));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getAllRoleAndPermissions,
  updateRolePermission
};
