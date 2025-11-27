'use strict';
const { Model, Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    static associate(models) {
      Session.belongsTo(models.Account, {
        foreignKey: 'account_id',  
        as: 'account',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }

    // Tự động dọn session hết hạn (cron job)
    static async deleteExpired() {
      const deleted = await this.destroy({
        where: {
          expire_at: { [Op.lt]: new Date() }
        }
      });
      if (deleted > 0) console.log(`Cleanup: Đã xóa ${deleted} session hết hạn`);
      return deleted;
    }

    // Function – DÙNG TRONG REFRESH TOKEN
    static async findValidByRefreshToken(token) {
      const session = await this.findOne({
        where: { refresh_token: token }
      });

      if (!session) return null;

      // Nếu hết hạn → XÓA LUÔN + trả null
      if (new Date() > session.expire_at) {
        await session.destroy();
        return null;
      }

      return session;
    }
  }

  Session.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    refresh_token: {
      type: DataTypes.STRING(512),    
      allowNull: false,
      unique: true                    
    },
    expire_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    account_id: {                     // ← ĐÚNG TÊN TRONG DBML: account_id
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Account',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Session',
    tableName: 'Sessions',
    timestamps: true,               // ← TỰ ĐỘNG createdAt, updatedAt
    indexes: [
      { unique: true, fields: ['refresh_token'] },
      { fields: ['expire_at'] },    // ← TỐI ƯU CHO CRON JOB
      { fields: ['account_id'] }
    ]
  });
  return Session;
};