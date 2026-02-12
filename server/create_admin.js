const { sequelize, User } = require('./src/database');
const bcrypt = require('bcryptjs');

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log("DB Connected.");

        const email = 'admin@tophits.com';
        const password = 'admin';
        const hashedPassword = await bcrypt.hash(password, 10);

        const [admin, created] = await User.findOrCreate({
            where: { email },
            defaults: {
                name: 'Administrador',
                password: hashedPassword,
                type: 'admin',
                active: true,
                artisticName: 'Admin System'
            }
        });

        if (created) {
            console.log("✅ Admin user created!");
            console.log("Email: admin@tophits.com");
            console.log("Password: admin");
        } else {
            console.log("⚠️ Admin user already exists. Updating password...");
            admin.password = hashedPassword;
            admin.type = 'admin'; // Ensure type is admin
            await admin.save();
            console.log("✅ Admin password reset to 'admin'.");
        }

    } catch (e) {
        console.error("Error:", e);
    }
};

run();
