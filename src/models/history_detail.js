'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class History_Detail extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    };
    History_Detail.init({
        history_id: DataTypes.INTEGER,
        product_name: DataTypes.TEXT,
        product_quantity: DataTypes.INTEGER,
        deleted_at: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'History_Detail',
    });
    return History_Detail;
};