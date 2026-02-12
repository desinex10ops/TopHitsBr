const { User, Track, sequelize } = require('../database');

exports.followUser = async (req, res) => {
    try {
        const followerId = req.user.id;
        const followingId = req.params.id;

        if (followerId == followingId) {
            return res.status(400).json({ error: 'Você não pode seguir a si mesmo.' });
        }

        const userToFollow = await User.findByPk(followingId);
        if (!userToFollow) return res.status(404).json({ error: 'Usuário não encontrado.' });

        const currentUser = await User.findByPk(followerId);

        await currentUser.addFollowing(userToFollow);

        // Update stats
        const followersCount = await userToFollow.countFollowers();
        let stats = userToFollow.stats || {};
        stats.followers = followersCount;
        userToFollow.stats = stats;
        userToFollow.changed('stats', true);
        await userToFollow.save();

        res.json({ message: 'Seguindo com sucesso!', followersCount });
    } catch (error) {
        console.error('Erro ao seguir:', error);
        res.status(500).json({ error: 'Erro ao processar solicitação.' });
    }
};

exports.unfollowUser = async (req, res) => {
    try {
        const followerId = req.user.id;
        const followingId = req.params.id;

        const userToUnfollow = await User.findByPk(followingId);
        if (!userToUnfollow) return res.status(404).json({ error: 'Usuário não encontrado.' });

        const currentUser = await User.findByPk(followerId);

        await currentUser.removeFollowing(userToUnfollow);

        // Update stats
        const followersCount = await userToUnfollow.countFollowers();
        let stats = userToUnfollow.stats || {};
        stats.followers = followersCount;
        userToUnfollow.stats = stats;
        userToUnfollow.changed('stats', true);
        await userToUnfollow.save();

        res.json({ message: 'Deixou de seguir.', followersCount });
    } catch (error) {
        console.error('Erro ao deixar de seguir:', error);
        res.status(500).json({ error: 'Erro ao processar solicitação.' });
    }
};

exports.likeTrack = async (req, res) => {
    try {
        const userId = req.user.id;
        const trackId = req.params.id;

        const track = await Track.findByPk(trackId);
        if (!track) return res.status(404).json({ error: 'Música não encontrada.' });

        const user = await User.findByPk(userId);
        await user.addTrack(track); // Adds to UserLikes via association

        res.json({ message: 'Curtiu!' });
    } catch (error) {
        console.error('Erro ao curtir:', error);
        res.status(500).json({ error: 'Erro ao curtir música.' });
    }
};

exports.unlikeTrack = async (req, res) => {
    try {
        const userId = req.user.id;
        const trackId = req.params.id;

        const track = await Track.findByPk(trackId);
        if (!track) return res.status(404).json({ error: 'Música não encontrada.' });

        const user = await User.findByPk(userId);
        await user.removeTrack(track);

        res.json({ message: 'Descurtiu.' });
    } catch (error) {
        console.error('Erro ao descurtir:', error);
        res.status(500).json({ error: 'Erro ao descurtir música.' });
    }
};

exports.likePlaylist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params; // Playlist ID

        const playlist = await sequelize.models.Playlist.findByPk(id);
        if (!playlist) return res.status(404).json({ error: 'Playlist não encontrada.' });

        const user = await User.findByPk(userId);
        await user.addLikedPlaylist(playlist); // Using alias defined in database.js

        res.json({ message: 'Playlist curtida!' });
    } catch (error) {
        console.error('Erro ao curtir playlist:', error);
        res.status(500).json({ error: 'Erro ao curtir playlist.' });
    }
};

exports.unlikePlaylist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const playlist = await sequelize.models.Playlist.findByPk(id);
        if (!playlist) return res.status(404).json({ error: 'Playlist não encontrada.' });

        const user = await User.findByPk(userId);
        await user.removeLikedPlaylist(playlist);

        res.json({ message: 'Playlist descurtida.' });
    } catch (error) {
        console.error('Erro ao descurtir playlist:', error);
        res.status(500).json({ error: 'Erro ao descurtir playlist.' });
    }
};

exports.getSocialStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            include: [
                { model: User, as: 'Following', attributes: ['id'] },
                { model: Track, attributes: ['id'] }, // Liked tracks
                { model: sequelize.models.Playlist, as: 'LikedPlaylists', attributes: ['id'] } // Liked playlists
            ]
        });

        const followingIds = user.Following.map(u => u.id);
        const likedTrackIds = user.Tracks.map(t => t.id);
        const likedPlaylistIds = user.LikedPlaylists ? user.LikedPlaylists.map(p => p.id) : [];

        res.json({ following: followingIds, likedTracks: likedTrackIds, likedPlaylists: likedPlaylistIds });
    } catch (error) {
        console.error('Erro ao buscar status social:', error);
        res.status(500).json({ error: 'Erro ao buscar status.' });
    }
};
