'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Gallery extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Gallery.belongsTo(models.Product, { foreignKey: 'product_id', targetKey: 'id', as: 'data_Gallery' })
    }
  };
  Gallery.init({
    product_id: DataTypes.INTEGER,
    image: DataTypes.BLOB('long'),
    deleted_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Gallery',
  });
  return Gallery;
};