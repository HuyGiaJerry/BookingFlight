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
      // Payment belongs to Booking
      Payment.belongsTo(models.Booking, { foreignKey: 'booking_id', as: 'booking' });
    }
  }
  Payment.init({
    booking_id: DataTypes.INTEGER,
    amount: DataTypes.DOUBLE,
    payment_method: DataTypes.STRING,
    payment_status: DataTypes.STRING,
    transaction_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Payment',
  });
  return Payment;
};