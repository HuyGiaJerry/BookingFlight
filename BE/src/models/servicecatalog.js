'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ServiceCatalog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ServiceCatalog.init({
    code: DataTypes.STRING(50),
    title: DataTypes.STRING(200),
    description: DataTypes.STRING(500),
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'ServiceCatalog',
    tableName: 'ServiceCatalogs'
  });
  return ServiceCatalog;
};