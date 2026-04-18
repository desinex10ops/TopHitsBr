const rateLimit = require('express-rate-limit');

// Limiter for general API Endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per `windowMs` (Standard usage)
    message: { error: '⚠️ Muitas requisições desta rede, por favor tente novamente em 15 minutos.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter Limiter for Authentication (Registration/Login)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each IP to 20 login/register requests per windowMs
    message: { error: '⚠️ Muitas tentativas de login, por favor aguarde 1 hora.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter };
