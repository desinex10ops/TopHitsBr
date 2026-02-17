const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Order', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        total: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
            defaultValue: 'pending'
        },
        orderType: {
            type: DataTypes.ENUM('shop', 'credits'),
            defaultValue: 'shop'
        },
        packageId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        paymentMethod: {
            type: DataTypes.STRING, // 'pix', 'credit_card', etc.
            allowNull: true
        },
        paymentId: {
            type: DataTypes.STRING, // External gateway ID
            allowNull: true
        }
    });
};
