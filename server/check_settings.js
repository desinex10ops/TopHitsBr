const { sequelize, SystemSetting } = require('./src/database');

const check = async () => {
    try {
        await sequelize.authenticate();
        console.log("DB Connected.");

        const settings = await SystemSetting.findAll();
        settings.forEach(s => {
            if (s.key.includes('banner')) {
                console.log(`Key: ${s.key} | Value: ${s.value} | Type: ${s.type}`);
            }
        });

    } catch (e) {
        console.error("Error:", e);
    }
};

check();
