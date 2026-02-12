const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Withdrawal', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'paid', 'rejected'),
            defaultValue: 'pending'
        },
        pixKey: {
            type: DataTypes.STRING,
            allowNull: false
        },
        pixKeyType: {
            type: DataTypes.STRING, // 'cpf', 'email', 'phone', 'random'
            allowNull: false
        },
        rejectionReason: {
            type: DataTypes.STRING,
            allowNull: true
        },
        processedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    });
};
