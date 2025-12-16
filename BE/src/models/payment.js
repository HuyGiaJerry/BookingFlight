'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 1 Payemnt thuộc về 1 Booking
      Payment.belongsTo(models.Booking, {foreignKey: 'booking_id',as: 'booking'});
      
    }
  }
  Payment.init({
    id: DataTypes.UUID,
    booking_id: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL(15,2),
    payment_method: DataTypes.STRING(50),
    payment_status: DataTypes.STRING(50),
    transaction_id: DataTypes.STRING(200),
    gateway_response: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Payment',
  });
  return Payment;
};