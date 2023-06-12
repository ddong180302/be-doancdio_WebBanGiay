'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Order, { foreignKey: 'user_id', as: 'data_order' })
    }
  };
  User.init({
    fullName: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    password: DataTypes.STRING,
    avatar: DataTypes.BLOB('long'),
    role: DataTypes.STRING,
    deleted_at: DataTypes.DATE,
    refresh_token: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};