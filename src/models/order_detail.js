'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order_Detail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order_Detail.belongsTo(models.Order, { foreignKey: 'order_id', as: 'data_order_detail' })
    }
  };
  Order_Detail.init({
    order_id: DataTypes.INTEGER,
    product_id: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    num: DataTypes.INTEGER,
    total_money: DataTypes.FLOAT,
    deleted_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Order_Detail',
  });
  return Order_Detail;
};