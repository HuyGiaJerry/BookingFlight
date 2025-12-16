'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    
    static associate(models) {
      // 1 Payemnt thuộc về 1 Booking
      Payment.belongsTo(models.Booking, {foreignKey: 'booking_id',as: 'booking'});

    }
  }
  Payment.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false, 
      defaultValue: DataTypes.UUIDV4
    },
    booking_id: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL(15,2),
    payment_method: DataTypes.STRING(50),
    payment_status: DataTypes.STRING(50),
    transaction_id: DataTypes.STRING(200),
    gateway_response: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Payment',
    tableName: 'Payments',
  });
  return Payment;
};