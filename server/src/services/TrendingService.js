const { Op } = require('sequelize');
const { PlayHistory, Track, SystemSetting, sequelize } = require('../database');

const TRENDING_CACHE_KEY = 'trending_tracks_cache';

class TrendingService {

    /**
     * Calcula o "Termômetro Musical" e atualiza o Cache.
     * Score = (Plays ultimos 60m * 10) + (Plays ultimas 24h * 1)
     */
    static async updateTrendingCache() {
        console.log("[TrendingService] Atualizando Termômetro...");
        try {
            const now = new Date();
            const oneHourAgo = new Date(now - 60 * 60 * 1000);
            const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

            // 1. Plays da última hora
            const plays1h = await PlayHistory.findAll({
                attributes: ['TrackId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
                where: { createdAt: { [Op.gte]: oneHourAgo } },
                group: ['TrackId'],
                raw: true
            });

            // 2. Plays das últimas 24h
            const plays24h = await PlayHistory.findAll({
                attributes: ['TrackId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
                where: { createdAt: { [Op.gte]: twentyFourHoursAgo } },
                group: ['TrackId'],
                raw: true
            });

            // 3. Calcular Score
            const scores = {};

            plays24h.forEach(p => {
                const tid = p.TrackId;
                if (!scores[tid]) scores[tid] = 0;
                scores[tid] += parseInt(p.count) * 1; // Peso 1 para 24h
            });

            plays1h.forEach(p => {
                const tid = p.TrackId;
                if (!scores[tid]) scores[tid] = 0;
                scores[tid] += parseInt(p.count) * 10; // Peso 10 para 1h (BONUS)
            });

            // 4. Ordenar e pegar Top 20 IDs
            const sortedIds = Object.keys(scores)
                .sort((a, b) => scores[b] - scores[a])
                .slice(0, 20);

            if (sortedIds.length === 0) {
                console.log("[TrendingService] Nenhum play recente.");
                return;
            }

            // 5. Hidratar com dados da Música
            const trendingTracks = await Track.findAll({
                where: { id: sortedIds },
                attributes: ['id', 'title', 'artist', 'coverpath', 'plays', 'duration', 'UserId', 'album']
            });

            // Reordenar conforme o score (pois o findAll não garante ordem)
            const orderedTracks = sortedIds
                .map(id => trendingTracks.find(t => t.id == id))
                .filter(Boolean);

            // 6. Salvar no Cache (SystemSetting)
            let setting = await SystemSetting.findOne({ where: { key: TRENDING_CACHE_KEY } });
            if (!setting) {
                setting = await SystemSetting.create({
                    key: TRENDING_CACHE_KEY,
                    value: JSON.stringify(orderedTracks),
                    type: 'json'
                });
            } else {
                setting.value = JSON.stringify(orderedTracks);
                await setting.save();
            }

            console.log(`[TrendingService] Cache atualizado com ${orderedTracks.length} músicas.`);

        } catch (error) {
            console.error("[TrendingService] Erro ao atualizar:", error);
        }
    }

    static async getTrending() {
        try {
            const setting = await SystemSetting.findOne({ where: { key: TRENDING_CACHE_KEY } });
            if (setting) {
                return JSON.parse(setting.value);
            }
            return [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }
}

module.exports = TrendingService;
