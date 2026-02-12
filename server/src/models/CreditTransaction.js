const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('CreditTransaction', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('purchase', 'boost', 'bonus', 'refund', 'adjustment'),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        referenceId: {
            type: DataTypes.STRING, // Can store Boost ID or Payment ID
            allowNull: true
        }
    });
};
