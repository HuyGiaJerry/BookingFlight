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
      Account.hasMany(models.AccountUpdate, { foreignKey: 'account_id', as: 'accountUpdates' });

      // Account has many RoleUpdates
      Account.hasMany(models.RoleUpdate, { foreignKey: 'account_id', as: 'roleUpdates' });

      // Account has many Passengers
      Account.hasMany(models.Passenger, { foreignKey: 'account_id', as: 'passengers' });

      // Account has many BookingSessions
      Account.hasMany(models.BookingSession, { foreignKey: 'account_id', as: 'bookingSessions' });

      // Account has many Bookings
      Account.hasMany(models.Booking, { foreignKey: 'account_id', as: 'bookings' });


    }
  }
  Account.init({
    fullname: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [2, 100],
          msg: "Tên phải từ 2 đến 100 ký tự !"
        },
        is: {
          args: /^[A-Za-zÀ-ỹà-ỹ\s]{2,50}$/,
          msg: "Họ tên chỉ được chứa chữ và khoảng trắng"
        }
      }
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Email không được để trống !"
        },
        is: {
          args: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
          msg: "Email không đúng định dạng"
        },
        len: {
          args: [8, 100],
          msg: "Email phải từ 8 đến 100 ký tự !"
        }
      }
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
      // validate: {
      //   is: {
      //     args: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
      //     msg: "Password phải ≥ 8 ký tự và gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
      //   }
      // }
    },

    avatar: DataTypes.STRING,
    facebook_id: DataTypes.STRING,
    google_id: DataTypes.STRING,
    role_id: DataTypes.INTEGER,
    status: DataTypes.STRING,
    created_by: DataTypes.INTEGER,
    deleted_by: DataTypes.INTEGER,
    deleted_at: DataTypes.DATE,
    deleted: DataTypes.BOOLEAN

  }, {
    sequelize,
    modelName: 'Account',
    tableName: 'Accounts'
  });

  return Account;
};