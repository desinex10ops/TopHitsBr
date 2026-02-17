const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('ExportHistory', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        trackId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        exportedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });
};
