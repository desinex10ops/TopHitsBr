const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DownloadLog = sequelize.define('DownloadLog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userAgent: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('success', 'failed', 'blocked', 'expired'),
            defaultValue: 'success'
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true // Error message if failed
        }
    });

    DownloadLog.associate = (models) => {
        DownloadLog.belongsTo(models.DownloadLink);
        DownloadLog.belongsTo(models.User);
    };

    return DownloadLog;
};
