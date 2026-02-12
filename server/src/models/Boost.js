const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Boost', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        type: {
            type: DataTypes.ENUM('track', 'album'),
            allowNull: false
        },
        targetId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        targetName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        // Configuração da Campanha
        tier: {
            type: DataTypes.ENUM('basic', 'advanced', 'premium'),
            defaultValue: 'basic'
        },
        cost: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        durationDays: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('active', 'expired', 'cancelled', 'paused'),
            defaultValue: 'active'
        },
        // Metas de Entrega Garantida
        targetImpressions: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        targetPlays: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        // Métricas Reais
        impressions: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        plays: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        clicks: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        conversions: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        // Algoritmo Smart Score
        baseScore: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        currentScore: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        smartBoostActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    });
};
