const { sequelize, User } = require('./src/database');

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log("DB Connected.");

        const admins = await User.findAll({
            where: { type: 'admin' },
            attributes: ['id', 'name', 'email', 'type']
        });

        console.log(`\n=== ADMIN USERS ===`);
        if (admins.length === 0) {
            console.log("No admin users found.");
        } else {
            admins.forEach(u => {
                console.log(`[${u.id}] Name: ${u.name} | Email: ${u.email} | Type: ${u.type}`);
            });
        }

    } catch (e) {
        console.error("Error:", e);
    }
};

run();
