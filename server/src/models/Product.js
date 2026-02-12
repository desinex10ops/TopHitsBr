const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Product', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('remix', 'playback', 'pack_dj', 'pack_artist', 'solo', 'sample', 'preset', 'stem', 'mix', 'template', 'project'),
            defaultValue: 'remix'
        },
        previewPath: {
            type: DataTypes.STRING, // Audio preview (low quality or snippet)
            allowNull: true
        },
        fileData: {
            type: DataTypes.STRING, // Path to the actual product file (secure storage)
            allowNull: false
        },
        coverPath: {
            type: DataTypes.STRING
        },
        // Phase 2 Fields
        bpm: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        tonality: {
            type: DataTypes.STRING, // Ex: Cm, F# Major
            allowNull: true
        },
        tags: {
            type: DataTypes.JSON, // Array of strings ["House", "Bass", "Vocals"]
            allowNull: true
        },
        includedContent: {
            type: DataTypes.TEXT, // Description of what's inside (WAVs, MIDI, etc)
            allowNull: true
        },
        category: {
            type: DataTypes.STRING, // Sub-category like "Deep House", "Tech House"
            allowNull: true
        },
        stock: {
            type: DataTypes.INTEGER,
            defaultValue: -1 // -1 = Infinite/Digital, >0 = Limited Keys/Slots
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'banned'),
            defaultValue: 'active'
        },
        salesCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });
};
