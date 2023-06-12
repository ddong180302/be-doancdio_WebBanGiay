'use strict';
const { INTEGER } = require('sequelize');
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class History extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    History.init({
        user_id: DataTypes.INTEGER,
        user_name: DataTypes.STRING,
        user_email: DataTypes.STRING,
        user_phone: DataTypes.STRING,
        total_money: DataTypes.FLOAT,
        deleted_at: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'History',
    });
    return History;
};