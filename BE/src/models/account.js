'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {

    static associate(models) {
      //  Account belongs to 1 Role
      Account.belongsTo(models.Role, { foreignKey: 'role_id', as: 'role' });

      // Account has many AccountUpdates
      Account.hasMany(models.AccountUpdate, { foreignKey: 'account_id', as: 'accountUpdates' } );

      // Account has many RoleUpdates
      Account.hasMany(models.RoleUpdate, { foreignKey: 'account_id', as: 'roleUpdates' } );

      // Account has many Passengers
      Account.hasMany(models.Passenger, { foreignKey: 'account_id', as: 'passengers' } );

      // Account has many BookingSessions
      Account.hasMany(models.BookingSession, { foreignKey: 'account_id', as: 'bookingSessions' } );

      // Account has many Bookings
      Account.hasMany(models.Booking, { foreignKey: 'account_id', as: 'bookings' } );


    }
  }
  Account.init({
    fullname: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    avatar: DataTypes.STRING,
    facebook_id: DataTypes.STRING,
    google_id: DataTypes.STRING,
    role_id: DataTypes.INTEGER,
    status: DataTypes.STRING,
    created_by: DataTypes.INTEGER,
    deleted_by: DataTypes.INTEGER,
    deleted_at: DataTypes.DATE,
    deleted: DataTypes.BOOLEAN,
  }, {
    sequelize,
    modelName: 'Account',
    tableName: 'Accounts',
  });
  return Account;
};