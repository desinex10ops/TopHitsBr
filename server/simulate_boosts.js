const { User, Boost, sequelize } = require('./src/database');

async function simulateBoosts() {
    try {
        await sequelize.authenticate();

        // Find first 5 users
        const users = await User.findAll({ limit: 5 });
        if (users.length < 2) {
            console.log("Need at least 2 users to simulate.");
            return;
        }

        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        // User 1: Premium Boost on Track
        await Boost.create({
            type: 'track',
            targetId: 1, // assuming track 1 exists
            tier: 'premium',
            cost: 500,
            durationDays: 7,
            startDate: now,
            endDate: nextWeek,
            status: 'active',
            UserId: users[0].id
        });
        console.log(`User ${users[0].name} boosted with Premium.`);

        // User 2: Basic Boost on Album
        await Boost.create({
            type: 'album',
            targetId: 1, // dummy
            tier: 'basic',
            cost: 100,
            durationDays: 7,
            startDate: now,
            endDate: nextWeek,
            status: 'active',
            UserId: users[1].id
        });
        console.log(`User ${users[1].name} boosted with Basic.`);

    } catch (e) {
        console.error(e);
    }
}

simulateBoosts();
