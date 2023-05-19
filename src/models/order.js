'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'data_order' })
      Order.belongsTo(models.Report, { foreignKey: 'order_id', as: 'data_report' })
      Order.hasOne(models.Payment, { foreignKey: 'order_id', as: 'data_payment' })
      Order.hasMany(models.Order_Detail, { foreignKey: 'order_id', as: 'data_order_detail' })

    }
  };
  Order.init({
    user_id: DataTypes.INTEGER,
    fullName: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    note: DataTypes.TEXT,
    order_date: DataTypes.DATE,
    status: DataTypes.STRING,
    total_money: DataTypes.FLOAT,
    deleted_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};