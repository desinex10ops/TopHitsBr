const { Boost, User, Track, SystemSetting } = require('../database');
const { Op } = require('sequelize');

class FeaturedService {

    static async getFeaturedArtists() {
        try {
            // 1. Check Cache (Optional/Skipped for now as per previous logic)
            // const cacheKey = 'featured_artists_cache';

            // 2. Fetch Active Boosts
            const now = new Date();
            const boosts = await Boost.findAll({
                where: {
                    status: 'active',
                    endDate: { [Op.gt]: now }
                },
                include: [{
                    model: User,
                    attributes: ['id', 'artisticName', 'avatar', 'banner', 'bio']
                }]
            });

            // 3. Group by Artist and Weigh
            const artistMap = new Map();

            boosts.forEach(boost => {
                const user = boost.User;
                if (!user) return;

                artistMap.set(user.id, {
                    ...user.toJSON(),
                    score: 0,
                    boostType: boost.type,
                    boostTargetId: boost.targetId,
                    boostId: boost.id
                });

                const artist = artistMap.get(user.id);
                // Points per tier
                let points = 1; // Basic
                if (boost.tier === 'advanced') points = 3;
                if (boost.tier === 'premium') points = 5;

                // Keep track of the highest tier boost for the hero track logic
                // If there are multiple boosts, we prefer 'track' boost.
                if (boost.type === 'track') {
                    artist.boostTargetId = boost.targetId;
                    artist.boostType = 'track';
                }

                artist.score += points;
            });

            const allArtists = Array.from(artistMap.values());

            if (allArtists.length === 0) return [];

            // 4. Selection (Weighted/Sort)
            let selected = [];
            if (allArtists.length <= 10) {
                selected = allArtists.sort((a, b) => b.score - a.score);
            } else {
                // Simple weighted selection for now
                // Sort by score
                selected = allArtists.sort((a, b) => b.score - a.score).slice(0, 10);
            }

            // 5. Hydrate with Hero Track (Music to play)
            const hydrated = await Promise.all(selected.map(async (artist) => {
                let track = null;

                // Priority 1: Boosted Track
                const trackBoost = await Boost.findOne({
                    where: {
                        UserId: artist.id,
                        status: 'active',
                        type: 'track',
                        endDate: { [Op.gt]: new Date() }
                    }
                });

                if (trackBoost) {
                    track = await Track.findByPk(trackBoost.targetId);
                }

                // Priority 2: Most Popular Track
                if (!track) {
                    track = await Track.findOne({
                        where: { UserId: artist.id },
                        order: [['plays', 'DESC']],
                    });
                }

                // Priority 3: Any Track
                if (!track) {
                    track = await Track.findOne({ where: { UserId: artist.id } });
                }

                return {
                    ...artist,
                    heroTrack: track // Can be null
                };
            }));

            return hydrated;

        } catch (error) {
            console.error("Error fetching featured artists:", error);
            return [];
        }
    }
}

module.exports = FeaturedService;
