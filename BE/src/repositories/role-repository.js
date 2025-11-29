const CrudRepository = require('./crud-repository');
const { Role, RolePermission } = require('../models');


class RoleRepository extends CrudRepository {
  constructor() {
    super(Role);
  }

  // nếu cần custom query, thêm ở đây
  async findActiveWithPermissions(options = {}) {
    const { include, where } = options;
    return await this.model.findAll({
      where: { ...(where || {}), deleted: false },
      include: include || [],
      order: [['createdAt', 'DESC']]
    });
  }
  async findAndCountAll({ where = {}, limit = 20, offset = 0, order = [] }) {
    return Role.findAndCountAll({
      where,
      limit,
      offset,
      order
    });
  }
  async getAllRoleAndPermissions() {
    return await this.model.findAll({
      include: [
        {
          model: RolePermission,
          as: 'rolePermissions',
          attributes: ['permission']
        }
      ]
    });
  }
}

module.exports = RoleRepository;