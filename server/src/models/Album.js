const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Album = sequelize.define('Album', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        cover: {
            type: DataTypes.STRING
        },
        video: {
            type: DataTypes.STRING
        },
        releaseDate: {
            type: DataTypes.DATEONLY
        },
        genre: {
            type: DataTypes.STRING
        },
        description: {
            type: DataTypes.TEXT
        }
    });

    return Album;
};
