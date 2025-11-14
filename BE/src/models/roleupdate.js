'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RoleUpdate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // RoleUpdate belongs to Role
      RoleUpdate.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });

      // RoleUpdate belongs to Account
      RoleUpdate.belongsTo(models.Account, { foreignKey: 'account_id', as: 'account' } );
    }
  }
  RoleUpdate.init({
    role_id: DataTypes.INTEGER,
    account_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'RoleUpdate',
  });
  return RoleUpdate;
};