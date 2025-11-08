'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Session, { foreignKey: 'user_id', as: 'sessions' });
    }
  }
  User.init({
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    phone_number: DataTypes.STRING,
    password: DataTypes.STRING,
    address: DataTypes.STRING,
    google_id: DataTypes.INTEGER,
    facebook_id: DataTypes.INTEGER,
    is_active: DataTypes.INTEGER,
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'customer'
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};