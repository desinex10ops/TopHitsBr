const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Coupon', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        discountPercentage: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 100 }
        },
        producerId: {
            type: DataTypes.INTEGER,
            allowNull: true
            // Foreign key defined in database.js
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: true
            // If null, applies to all producer's products. If set, only specific product.
        },
        validUntil: {
            type: DataTypes.DATE,
            allowNull: true
        },
        usageLimit: {
            type: DataTypes.INTEGER,
            defaultValue: -1 // -1 = Infinite
        },
        usedCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });
};
