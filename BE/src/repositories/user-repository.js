const CrudRepository = require('./crud-repository');
const { Account, Role, RolePermission } = require('../models');
const { where, Op } = require('sequelize');
class UserRepository extends CrudRepository {
  constructor() {
    super(Account);
  }

  // write user-specific raw database queries below
  async findByPhoneNumber(phone_number) {
    try {
      const account = await this.model.findOne({
        where: { phone: phone_number }
      })
      console.log("account:", account)
      return account;
    } catch (error) {
      console.error("Error in CRUD (findByPhone):", error);
      throw error;
    }
  }
  async findByEmail(email) {
    try {
      const account = await this.model.findOne({
        where: { email: email }
      })
      console.log("account:", account)
      return account;
    } catch (error) {
      console.error("Error in CRUD (findByEmail):", error);
      throw error;
    }
  }
  async getWithRoleAndPermissions(userId) {
    try {
      console.log('[UserRepository] getWithRoleAndPermissions userId=', userId);
      const user = await this.model.findOne({
        where: { id: userId }, // deleted = false
        attributes: ['id', 'fullname', 'email', 'phone', 'role_id', 'status'],
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['id', 'title', 'status'],
            required: false,
            include: [
              {
                model: RolePermission,
                as: 'rolePermissions',
                attributes: ['permission'],
              },
            ],
          },
        ],
      });
      console.log('[UserRepository] result:', user ? { id: user.id, role: user.role && user.role.title } : null);
      return user;
    } catch (error) {
      console.error('Error in getWithRoleAndPermissions:', error);
      throw error;
    }
  }
  findWithPassword(email) {
    return Account.findOne({ where: { email } });
  }
  async getAccount() {
    try {
      const account = await this.model.findAll({
        attributes: ['id', 'fullname', 'avatar', 'status'],
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['title'],
            where: { title: { [Op.ne]: 'Customer' } }
          }
        ],
      });
      return account;
    } catch (error) {
      console.error('Error in getAccount:', error);
      throw error;
    }
  }
}

module.exports = UserRepository;