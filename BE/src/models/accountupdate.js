'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AccountUpdate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // AccountUpdate belongs to 1 Account
      AccountUpdate.belongsTo(models.Account, { foreignKey: 'account_id', as: 'account' });
    }
  }
  AccountUpdate.init({
    account_id: DataTypes.INTEGER,
    updated_by: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'AccountUpdate',
  });
  return AccountUpdate;
};