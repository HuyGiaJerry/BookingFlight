const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const RoleRepository = require('../repositories/role-repository');

class RoleService {
  constructor(roleRepository) {
    this.roleRepository = roleRepository || new RoleRepository();
  }

  // LIST / PAGINATION
  async list({ page = 1, limit = 20, where = {} } = {}) {
    try {
      page = parseInt(page);
      limit = parseInt(limit);
      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1) limit = 20;

      const offset = (page - 1) * limit;

      const { rows, count } = await this.roleRepository.findAndCountAll({
        where: { deleted: false, ...where },
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });
      console.log('Fetched roles:', rows);
      console.log('Total count:', count);
      return {
        items: rows,
        pagination: {
          page,
          limit,
          total: count
        }
      };
    } catch (error) {
      throw new AppError('Unable to fetch roles', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // GET BY ID
  async getById(id) {
    const role = await this.roleRepository.get(id);
    if (!role) throw new AppError('Role not found', StatusCodes.NOT_FOUND);
    return role;
  }

  // CREATE
  async create(payload) {
    try {
      if (!payload || !payload.title) {
        throw new AppError('Role name is required', StatusCodes.BAD_REQUEST);
      }

      return await this.roleRepository.create(payload);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Unable to create role', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // UPDATE
  async update(id, payload) {
    try {
      const updated = await this.roleRepository.update(id, payload);
      if (!updated) throw new AppError('Role not found', StatusCodes.NOT_FOUND);
      return updated;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Unable to update role', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // SOFT DELETE
  async softDelete(id) {
    try {
      const deleted = this.roleRepository.softDelete
        ? await this.roleRepository.softDelete(id)
        : await this.roleRepository.update(id, { deleted: true });

      if (!deleted) throw new AppError('Role not found', StatusCodes.NOT_FOUND);
      return deleted;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Unable to delete role', StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
  // update role
}

module.exports = RoleService;
