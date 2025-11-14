'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    
    static associate(models) {
      // RolePermission belongs to Role
      RolePermission.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });
    }
  }
  RolePermission.init({
    role_id: DataTypes.INTEGER,
    permission: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'RolePermission',
  });
  return RolePermission;
};