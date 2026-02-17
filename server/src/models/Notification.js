const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Notification = sequelize.define('Notification', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        type: {
            type: DataTypes.ENUM('info', 'sale', 'comment', 'system', 'boost', 'chat_message', 'new_message'),
            defaultValue: 'info'
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        data: {
            type: DataTypes.JSON,
            allowNull: true
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });

    return Notification;
};
