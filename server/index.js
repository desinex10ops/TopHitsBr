require('dotenv').config();
const express = require('express'); // Force restart 2
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { initDb } = require('./src/database');

// Middleware Security Hardening
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allows images/audio to be fetched cross-origin
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "http://localhost:*", "http://192.168.*.*", "ws://localhost:*"],
            imgSrc: ["'self'", "data:", "blob:", "*"], // '*' necessary for external avatars/covers if applicable
            mediaSrc: ["'self'", "data:", "blob:", "*"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
        },
    },
}));

// Dynamic CORS for Local Network
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or updates)
        if (!origin) return callback(null, true);

        // Allow localhost and local network IPs (192.168.x.x)
        if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://192.168.') || origin.startsWith('http://localhost')) {
            callback(null, true);
        } else {
            console.log('CORS blocked:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { apiLimiter } = require('./src/middleware/rateLimiter');

app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

app.use('/api', apiLimiter);


// Serve static files from storage
// Serve static files from storage with explicit CORS
app.use('/storage', express.static(path.join(__dirname, 'storage'), {
    setHeaders: (res, path, stat) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));

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
const playlistRoutes = require('./src/routes/playlistRoutes');
app.use('/api/playlists', playlistRoutes);

const commentRoutes = require('./src/routes/commentRoutes');
app.use('/api/comments', commentRoutes);

const creditRoutes = require('./src/routes/creditRoutes');
const boostRoutes = require('./src/routes/boostRoutes');
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

const userRoutes = require('./src/routes/userRoutes');
app.use('/api/users', userRoutes);

const reviewRoutes = require('./src/routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

const adminRoutes = require('./src/routes/adminRoutes');
app.use('/api/admin', adminRoutes);

const chatRoutes = require('./src/routes/chatRoutes');
app.use('/api/chat', chatRoutes);

const notificationRoutes = require('./src/routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);


const errorHandler = require('./src/middleware/errorMiddleware');
app.use(errorHandler);

const http = require('http');
const { Server } = require('socket.io');
const NotificationService = require('./src/services/NotificationService');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Initialize Notification Service
NotificationService.init(io);

// Serve Static Assets (Production Build)
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Handle SPA Routing (Send index.html for any unknown route)
app.use((req, res) => {
    // Determine if request is for API or Storage (should have been handled above)
    // If we are here, it's likely a frontend route
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || `http://localhost:${PORT}`;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`- API URL: ${API_URL}`);
    console.log(`- Music API: ${API_URL}/api/music`);
    console.log(`- Storage: ${API_URL}/storage`);
    console.log(`- Socket.io: Enabled`);
});
