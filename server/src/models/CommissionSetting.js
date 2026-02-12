const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('CommissionSetting', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        defaultRate: {
            type: DataTypes.DECIMAL(5, 2), // Percentage, e.g., 10.00
            defaultValue: 10.00,
            allowNull: false
        },
        minWithdrawalAmount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 50.00
        },
        automaticWithdrawalDay: {
            type: DataTypes.INTEGER, // 1-31, 0 for disabled
            defaultValue: 0
        }
    });
};
