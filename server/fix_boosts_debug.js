const { User, Boost, sequelize } = require('./src/database');

async function fixBoosts() {
    try {
        await sequelize.authenticate();

        // Ensure we have users with active boosts
        const boosts = await Boost.findAll({ where: { status: 'active' }, include: [User] });
        console.log(`Active boosts found: ${boosts.length}`);

        if (boosts.length === 0) {
            console.log("No active boosts. Creating...");
            const user = await User.findOne();
            if (user) {
                await Boost.create({
                    type: 'track',
                    targetId: 1,
                    tier: 'premium',
                    cost: 500,
                    durationDays: 7,
                    startDate: new Date(),
                    endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
                    status: 'active',
                    UserId: user.id
                });
                console.log(`Boost created for ${user.name}`);
            }
        } else {
            boosts.forEach(b => console.log(`- ${b.User ? b.User.artisticName : 'Unknown'}: ${b.tier}`));
        }

    } catch (e) {
        console.error(e);
    }
}

fixBoosts();
