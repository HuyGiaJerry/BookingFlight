'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {

    static associate(models) {
      // Role has many Accounts
      Role.hasMany(models.Account, { foreignKey: 'role_id', as: 'accounts' });

      // Role has many RoleUpdates
      Role.hasMany(models.RoleUpdate, { foreignKey: 'role_id', as: 'roleUpdates' });

      // Role has many RolePermissions
      Role.hasMany(models.RolePermission, { foreignKey: 'role_id', as: 'rolePermissions' });
    }
  }
  Role.init({
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    status: DataTypes.STRING,
    created_by: DataTypes.INTEGER,
    deleted_by: DataTypes.INTEGER,
    deleted_at: DataTypes.DATE,
    deleted: DataTypes.BOOLEAN,

  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'Roles',
  });
  return Role;
};