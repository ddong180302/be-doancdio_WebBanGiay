'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Report extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Report.hasMany(models.Order, { foreignKey: 'order_id', as: 'data_report' })
    }
  };
  Report.init({
    order_id: DataTypes.INTEGER,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
    total_revenue: DataTypes.FLOAT,
    total_products_sold: DataTypes.FLOAT,
    deleted_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Report',
  });
  return Report;
};