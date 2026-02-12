const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DownloadLink = sequelize.define('DownloadLink', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        token: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false
        },
        maxDownloads: {
            type: DataTypes.INTEGER,
            defaultValue: 3
        },
        downloadCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        lockedIp: {
            type: DataTypes.STRING,
            allowNull: true // If set, only this IP can download
        }
    });

    DownloadLink.associate = (models) => {
        DownloadLink.belongsTo(models.User); // Buyer
        DownloadLink.belongsTo(models.Product); // Product
        DownloadLink.belongsTo(models.Order); // Original Transaction
    };

    return DownloadLink;
};
