const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const { initDb } = require('./src/database');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from storage
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// Initialize Database
console.log('Initializing Database...');
initDb();

// Routes Imports
const musicRoutes = require('./src/routes/musicRoutes');
const authRoutes = require('./src/routes/authRoutes');
const socialRoutes = require('./src/routes/socialRoutes');

// Mount Routes
// IMPORTANT: Mounting music routes at /api/music to match frontend calls
app.use('/api/music', musicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/social', socialRoutes);

const commentRoutes = require('./src/routes/commentRoutes');
app.use('/api/comments', commentRoutes);

const creditRoutes = require('./src/routes/creditRoutes');
const boostRoutes = require('./src/routes/boostRoutes');
app.use('/api/credits', creditRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/boost', boostRoutes);

const shopRoutes = require('./src/routes/shopRoutes');
app.use('/api/shop', shopRoutes);

const marketingRoutes = require('./src/routes/marketingRoutes');
app.use('/api/marketing', marketingRoutes);

const financeRoutes = require('./src/routes/financeRoutes');
app.use('/api/finance', financeRoutes);

const paymentRoutes = require('./src/routes/paymentRoutes');
app.use('/api/payment', paymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    // Multer errors usually have a code or helpful message
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Arquivo muito grande.' });
    }
    // Handle other specific errors if needed
    res.status(500).json({ error: err.message || 'Erro interno no servidor.' });
});

const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`- API URL: ${API_URL}`);
    console.log(`- Music API: ${API_URL}/api/music`);
    console.log(`- Storage: ${API_URL}/storage`);
});
