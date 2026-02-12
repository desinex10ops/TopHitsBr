const { Playlist, User, sequelize } = require('./src/database');

const seedPlaylists = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        // Force sync to add new columns (DROP and CREATE)
        await Playlist.sync({ force: true });
        console.log('Playlist Schema Synced.');

        const userId = 5; // TopHitsBR

        const playlists = [
            {
                name: "Só as Melhores 2024",
                description: "As músicas que agitaram o ano!",
                type: 'user',
                UserId: userId,
                plays: 15420,
                cover: null // Will use fallback
            },
            {
                name: "Paredão Atualizado",
                description: "Pra tocar no talo no fim de semana.",
                type: 'user',
                UserId: userId,
                plays: 8930,
                cover: null
            },
            {
                name: "Funk Consciente",
                description: "Ritmo e poesia da favela.",
                type: 'user',
                UserId: userId,
                plays: 12500,
                cover: null
            },
            {
                name: "Modão Sertanejo",
                description: "Clássicos para ouvir tomando uma.",
                type: 'user',
                UserId: userId,
                plays: 23100,
                cover: null
            },
            {
                name: "Treino Pesado",
                description: "Foco e força na academia.",
                type: 'user',
                UserId: userId,
                plays: 5600,
                cover: null
            },
            {
                name: "Chill Vibes",
                description: "Para relaxar e estudar.",
                type: 'user',
                UserId: userId,
                plays: 3200,
                cover: null
            }
        ];

        for (const p of playlists) {
            await Playlist.create(p);
            console.log(`Created: ${p.name}`);
        }

        console.log('Seeding completed!');
        process.exit();
    } catch (error) {
        console.error("Error seeding:", error);
        process.exit(1);
    }
};

seedPlaylists();
