const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Transaction', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        type: {
            type: DataTypes.ENUM('sale', 'withdrawal', 'commission', 'deposit', 'refund'),
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
            defaultValue: 'pending'
        },
        description: {
            type: DataTypes.STRING
        },
        paymentMethod: {
            type: DataTypes.STRING // 'pix', 'credit_card', 'internal'
        },
        gatewayTransactionId: {
            type: DataTypes.STRING
        },
        metadata: {
            type: DataTypes.JSON // Store split details, product info
        }
    });
};
