'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BookingSession extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // BookingSession belongs to Account
      BookingSession.belongsTo(models.Account, { foreignKey: 'account_id', as: 'account' } );
    }
  }
  BookingSession.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    account_id:{
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Accounts',
        key: 'id'
      }
    },
    session_data: DataTypes.JSON,
    total_estimate: DataTypes.DECIMAL(10, 2),
    expire_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'BookingSession',
    tableName: 'BookingSessions',
  });
  return BookingSession;
};