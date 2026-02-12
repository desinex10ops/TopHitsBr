const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const FeaturedService = require('../services/FeaturedService');
const boostController = require('../controllers/boostController');

// Rota pública: Artistas em Destaque (Quem Impulsiona)
router.get('/featured-artists', async (req, res) => {
    try {
        const artists = await FeaturedService.getFeaturedArtists();
        res.json(artists);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar artistas em destaque.' });
    }
});

// Registrar Interação (Clique/Play)
router.post('/interaction', boostController.trackInteraction);

// Outras rotas de boost podem vir aqui futuramente (ex: criar boost, listar boosts ativos)

module.exports = router;
