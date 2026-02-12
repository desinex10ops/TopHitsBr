const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Conexão SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
});

// Modelo: Música
const Track = sequelize.define('Track', {
    title: { type: DataTypes.STRING, allowNull: false },
    artist: { type: DataTypes.STRING, allowNull: false },
    album: { type: DataTypes.STRING },
    genre: { type: DataTypes.STRING },
    vibe: { type: DataTypes.STRING }, // Paredão, Rebaixado, etc.
    filepath: { type: DataTypes.STRING, allowNull: false }, // Caminho relativo para storage/music
    coverpath: { type: DataTypes.STRING }, // Caminho relativo para storage/covers
    duration: { type: DataTypes.INTEGER }, // Segundos
    plays: { type: DataTypes.INTEGER, defaultValue: 0 },
    downloads: { type: DataTypes.INTEGER, defaultValue: 0 },
    // Novos campos para Cantores
    composer: { type: DataTypes.STRING },
    instagram: { type: DataTypes.STRING },
    youtubeLink: { type: DataTypes.STRING },
    isExplicit: { type: DataTypes.BOOLEAN, defaultValue: false },
    // Campos Karaokê
    hasKaraoke: { type: DataTypes.BOOLEAN, defaultValue: false },
    karaokeFile: { type: DataTypes.STRING }, // Caminho do instrumental
    lyrics: { type: DataTypes.TEXT } // JSON ou LRC
});

// Modelo: Playlist
const Playlist = sequelize.define('Playlist', {
    name: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM('user', 'auto'), defaultValue: 'user' },
    rules: { type: DataTypes.JSON }, // Para playlists inteligentes
    description: { type: DataTypes.STRING },
    cover: { type: DataTypes.STRING },
    plays: { type: DataTypes.INTEGER, defaultValue: 0 }
});

// Modelo: Usuário
const User = sequelize.define('User', {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM('listener', 'artist', 'admin'), defaultValue: 'listener' },
    artisticName: { type: DataTypes.STRING },
    bio: { type: DataTypes.STRING },
    avatar: { type: DataTypes.STRING }, // URL ou caminho
    banner: { type: DataTypes.STRING }, // URL ou caminho
    bannerVideo: { type: DataTypes.STRING }, // [NEW] URL ou caminho do vídeo
    instagram: { type: DataTypes.STRING },
    youtube: { type: DataTypes.STRING },
    tiktok: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    state: { type: DataTypes.STRING },
    stats: { type: DataTypes.JSON, defaultValue: { plays: 0, downloads: 0, followers: 0 } },
    preferences: { type: DataTypes.JSON, defaultValue: { notifications: true, darkMode: true } }, // [NEW]
    active: { type: DataTypes.BOOLEAN, defaultValue: true } // Para banimento
});

// Associações
User.hasMany(Track);
Track.belongsTo(User);

User.hasMany(Playlist);
Playlist.belongsTo(User);

// Relações N:M (Likes/Favorites)
User.belongsToMany(Track, { through: 'UserLikes' });
Track.belongsToMany(User, { through: 'UserLikes' });

// Relações N:M (Follows)
User.belongsToMany(User, { as: 'Followers', through: 'UserFollows', foreignKey: 'followingId', otherKey: 'followerId' });
User.belongsToMany(User, { as: 'Following', through: 'UserFollows', foreignKey: 'followerId', otherKey: 'followingId' });

// Relações N:M (Playlist Tracks)
const PlaylistTrack = sequelize.define('PlaylistTrack', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    order: { type: DataTypes.INTEGER, defaultValue: 0 } // Para ordenar a playlist
});

Playlist.belongsToMany(Track, { through: PlaylistTrack });
Track.belongsToMany(Playlist, { through: PlaylistTrack });

// Modelo: SystemSetting
// Modelo: SystemSetting
// Modelo: SystemSetting
const SystemSetting = sequelize.define('SystemSetting', {
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    value: {
        type: DataTypes.TEXT, // Storing as JSON string or plain text
        allowNull: false
    },
    description: {
        type: DataTypes.STRING
    },
    type: {
        type: DataTypes.ENUM('string', 'boolean', 'json', 'number'),
        defaultValue: 'string'
    }
});

// Modelo: Notícias do Artista
const ArtistNews = sequelize.define('ArtistNews', {
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT },
    image: { type: DataTypes.STRING }, // URL ou path relativ
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// --- Início Sistema de Créditos ---
const WalletModel = require('./models/Wallet');
const CreditTransactionModel = require('./models/CreditTransaction');
const CreditPackageModel = require('./models/CreditPackage');
const BoostModel = require('./models/Boost');
const AlbumModel = require('./models/Album'); // [NEW]

const Wallet = WalletModel(sequelize);
const CreditTransaction = CreditTransactionModel(sequelize);
const CreditPackage = CreditPackageModel(sequelize);
const Boost = BoostModel(sequelize);
const Album = AlbumModel(sequelize); // [NEW]

// Associações Carteira
User.hasOne(Wallet);
Wallet.belongsTo(User);

Wallet.hasMany(CreditTransaction);
CreditTransaction.belongsTo(Wallet);

// Associações Boost
User.hasMany(Boost);
Boost.belongsTo(User);

// Associações Album [NEW]
User.hasMany(Album);
Album.belongsTo(User);

Album.hasMany(Track);
Track.belongsTo(Album);

// Associações News
User.hasMany(ArtistNews);
ArtistNews.belongsTo(User);

// Modelo: PlayHistory (Termômetro Musical)
const PlayHistory = sequelize.define('PlayHistory', {
    ip: { type: DataTypes.STRING }, // IP do ouvinte
    userAgent: { type: DataTypes.STRING }, // Navegador/Device
    completed: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// Associações PlayHistory
Track.hasMany(PlayHistory);
PlayHistory.belongsTo(Track);
User.hasMany(PlayHistory);
PlayHistory.belongsTo(User);

// --- Shop / Marketplace Models ---
const ProductModel = require('./models/Product');
const OrderModel = require('./models/Order');
const OrderItemModel = require('./models/OrderItem');
const WithdrawalModel = require('./models/Withdrawal');
const TransactionModel = require('./models/Transaction'); // [NEW]
const CommissionSettingModel = require('./models/CommissionSetting'); // [NEW]
const CouponModel = require('./models/Coupon');
const ReviewModel = require('./models/Review');

const Product = ProductModel(sequelize);
const Order = OrderModel(sequelize);
const OrderItem = OrderItemModel(sequelize);
const Withdrawal = WithdrawalModel(sequelize);
const Transaction = TransactionModel(sequelize); // [NEW]
const CommissionSetting = CommissionSettingModel(sequelize); // [NEW]
const Coupon = CouponModel(sequelize);
const Review = ReviewModel(sequelize);

// Associações Shop
// User (Producer) has many Products
User.hasMany(Product, { foreignKey: 'producerId', as: 'Products' });
Product.belongsTo(User, { foreignKey: 'producerId', as: 'Producer' });

// User (Producer) Manages Coupons
User.hasMany(Coupon, { foreignKey: 'producerId' });
Coupon.belongsTo(User, { foreignKey: 'producerId' });

// Reviews
User.hasMany(Review, { foreignKey: 'userId' }); // Reviewer
Review.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Review, { foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

// User (Buyer) has many Orders
User.hasMany(Order, { foreignKey: 'buyerId' });
Order.belongsTo(User, { foreignKey: 'buyerId', as: 'Buyer' });

// Order has many OrderItems
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

// OrderItem belongs to Product
Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

// User (Producer) has many Withdrawals
User.hasMany(Withdrawal);
Withdrawal.belongsTo(User);

// Transactions
User.hasMany(Transaction, { foreignKey: 'payerId', as: 'Debits' }); // As Payer
User.hasMany(Transaction, { foreignKey: 'payeeId', as: 'Credits' }); // As Payee
Transaction.belongsTo(User, { foreignKey: 'payerId', as: 'Payer' });
Transaction.belongsTo(User, { foreignKey: 'payeeId', as: 'Payee' });

Transaction.belongsTo(Product); // Optional link to product

// Commission Settings (Global or User specific if needed later)
// For now, just global, no relation needed via Sequelize unless per user.

const DownloadLinkModel = require('./models/DownloadLink');
const DownloadLogModel = require('./models/DownloadLog');

const DownloadLink = DownloadLinkModel(sequelize);
const DownloadLog = DownloadLogModel(sequelize);

// Associações Anti-Pirataria
DownloadLink.belongsTo(User); // Quem comprou
DownloadLink.belongsTo(Product);
DownloadLink.belongsTo(Order);

DownloadLog.belongsTo(DownloadLink);
DownloadLog.belongsTo(User); // Quem tentou baixar

// --- Fim Sistema de Créditos / Shop ---

// Modelo: Comentários
const Comment = sequelize.define('Comment', {
    content: { type: DataTypes.TEXT, allowNull: false },
    approved: { type: DataTypes.BOOLEAN, defaultValue: true } // Para moderação futura
});

// Associações Comentários
User.hasMany(Comment);
Comment.belongsTo(User);

Track.hasMany(Comment);
Comment.belongsTo(Track);

Playlist.hasMany(Comment);
Comment.belongsTo(Playlist);

// Relações N:M (Playlist Likes)
User.belongsToMany(Playlist, { as: 'LikedPlaylists', through: 'UserPlaylistLikes' });
Playlist.belongsToMany(User, { as: 'Likers', through: 'UserPlaylistLikes' });

const initDb = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Sync models
        try {
            await User.sync({ alter: true }); // [UPDATED] to add bannerVideo
        } catch (e) {
            console.log("User sync error (ignored):", e.message);
        }
        await Album.sync(); // [NEW]
        try {
            await Track.sync(); // Needs AlbumId
        } catch (e) {
            console.log("Track sync error (ignored):", e.message);
        }
        await Playlist.sync();
        await PlaylistTrack.sync();
        // Sync new UserPlaylistLikes table
        try {
            await sequelize.models.UserPlaylistLikes.sync();
        } catch (e) { console.log("UserPlaylistLikes sync error:", e.message); }

        await SystemSetting.sync();
        await ArtistNews.sync();
        await Comment.sync({ alter: true }); // Alter to add PlaylistId

        // Sync Credit System
        await Wallet.sync();
        await CreditTransaction.sync();
        await CreditPackage.sync();
        await CreditPackage.sync();
        await Boost.sync();

        // Sync Shop
        await Product.sync({ alter: true }); // Phase 2: Added fields
        await Order.sync();
        await OrderItem.sync();
        await Withdrawal.sync();
        await Transaction.sync(); // [NEW]
        await CommissionSetting.sync(); // [NEW]
        await Coupon.sync(); // [NEW] Phase 2
        await Review.sync(); // [NEW] Phase 2

        // Sync Anti-Piracy
        await DownloadLink.sync();
        await DownloadLog.sync();

        // Sync Trending
        // Internally requiring to ensure scope or just depend on definition
        // Actually, better to just access it if it was defined in scope.
        // User, Track etc are defined in scope. PlayHistory is too.
        await sequelize.models.PlayHistory.sync(); // Access via sequelize.models to be safe

        // --- MIGRATION: TRACKS TO ALBUMS ---
        try {
            const tracksWithoutAlbumId = await Track.findAll({ where: { AlbumId: null } });
            if (tracksWithoutAlbumId.length > 0) {
                console.log("Starting Album Migration...");
                let migratedCount = 0;

                // Group by User + AlbumName
                // Map: UserId -> { AlbumName -> { cover, genre, tracks: [] } }
                const userAlbums = {};

                for (const track of tracksWithoutAlbumId) {
                    if (!track.album || !track.UserId) continue;

                    if (!userAlbums[track.UserId]) userAlbums[track.UserId] = {};
                    if (!userAlbums[track.UserId][track.album]) {
                        userAlbums[track.UserId][track.album] = {
                            cover: track.coverpath,
                            genre: track.genre,
                            tracks: []
                        };
                    }
                    userAlbums[track.UserId][track.album].tracks.push(track);
                }

                for (const userId in userAlbums) {
                    for (const albumName in userAlbums[userId]) {
                        const data = userAlbums[userId][albumName];

                        // Find or Create Album
                        const [album, created] = await Album.findOrCreate({
                            where: {
                                title: albumName,
                                UserId: userId
                            },
                            defaults: {
                                cover: data.cover,
                                genre: data.genre
                            }
                        });

                        // Update Tracks
                        for (const track of data.tracks) {
                            track.AlbumId = album.id;
                            await track.save();
                            migratedCount++;
                        }
                    }
                }
                console.log(`Album migration completed. Migrated ${migratedCount} tracks.`);
            }
        } catch (migErr) {
            console.error("Migration Error:", migErr);
        }
        // -----------------------------------

        console.log('Database synced.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

module.exports = {
    sequelize,
    Track,
    Playlist,
    User,
    PlaylistTrack,
    SystemSetting,
    Wallet,
    CreditTransaction,
    CreditPackage,
    Boost,
    ArtistNews,
    PlayHistory, // Exporting new model
    Album, // [NEW]
    Comment, // [NEW]
    Product, // [Shop]
    Order, // [Shop]
    OrderItem, // [Shop]
    Withdrawal, // [Shop]
    Transaction, // [Shop]
    CommissionSetting, // [Shop]
    Coupon,
    Review,
    DownloadLink,
    DownloadLog,
    initDb
};
