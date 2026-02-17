
/**
 * Middleware to check if the authenticated user is a registered seller.
 * Used to protect producer-only marketplace operations.
 */
const sellerMiddleware = (req, res, next) => {
    if (req.user && (req.user.isSeller || req.user.type === 'admin')) {
        next();
    } else {
        res.status(403).json({
            error: 'Acesso negado. Você precisa se registrar como vendedor para realizar esta operação.'
        });
    }
};

module.exports = sellerMiddleware;
