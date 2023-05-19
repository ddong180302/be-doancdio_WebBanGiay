'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Galery extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Galery.belongsTo(models.Product, { foreignKey: 'product_id', as: 'data_galery' })
    }
  };
  Galery.init({
    product_id: DataTypes.INTEGER,
    image: DataTypes.BLOB('long'),
    deleted_at: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Galery',
  });
  return Galery;
};