const rateLimit = require('express-rate-limit');

// EMERGENCY DISABLE: Rate Limiting is causing issues.
// We are replacing it with a pass-through function.

const apiLimiter = (req, res, next) => {
    // console.log('Rate Limiter Bypassed for:', req.url);
    next();
};

const authLimiter = (req, res, next) => {
    next();
};

module.exports = { apiLimiter, authLimiter };
