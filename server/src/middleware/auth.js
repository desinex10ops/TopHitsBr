const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tophitsbr_secret_key_123';

module.exports = (req, res, next) => {
    // Obter token do header
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, type, iat, exp }
        next();
    } catch (error) {
        res.status(400).json({ error: 'Token inválido.' });
    }
};
