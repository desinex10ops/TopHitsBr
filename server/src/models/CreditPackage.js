const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('CreditPackage', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        credits: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        price: {
            type: DataTypes.FLOAT, // or DECIMAL(10, 2)
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });
};
