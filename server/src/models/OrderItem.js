const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('OrderItem', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Price at the moment of purchase'
        },
        commissionRate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 20.00, // 20% default
            comment: 'Percentage taken by platform'
        },
        producerAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'Amount credited to producer (Price - Commission)'
        }
    });
};
