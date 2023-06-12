'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.hasMany(models.Gallery, { foreignKey: 'product_id', as: 'data_gallery' })
      Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'data_product' })
    }
  };
  Product.init({
    category_id: DataTypes.INTEGER,
    name: DataTypes.TEXT,
    price: DataTypes.FLOAT,
    quantity: DataTypes.INTEGER,
    sold: DataTypes.INTEGER,
    thumbnail: DataTypes.BLOB('long'),
    deleted_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};