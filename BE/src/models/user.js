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
      // User có nhiều Session
      User.hasMany(models.Session, { foreignKey: 'user_id', as: 'sessions' });

      // User có nhiều Booking
      User.hasMany(models.Booking, { foreignKey: 'user_id', as: 'bookings' } );
    }
  }
  User.init({
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    phone_number: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    logo_url: DataTypes.STRING,
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