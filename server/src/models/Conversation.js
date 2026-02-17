const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Conversation = sequelize.define('Conversation', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user1Id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user2Id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });

    return Conversation;
};
