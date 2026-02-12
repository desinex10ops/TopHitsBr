const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Wallet', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        balance: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
            allowNull: false
        },
        pending_balance: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
            allowNull: false
        },
        credits: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        currency: {
            type: DataTypes.STRING,
            defaultValue: 'BRL'
        }
    });
};
