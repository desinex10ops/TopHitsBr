const { sequelize, SystemSetting } = require('./src/database');

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log("DB Connected.");

        const setting = await SystemSetting.findOne({ where: { key: 'banner_video' } });
        if (setting && !setting.value.startsWith('music/')) {
            console.log(`Fixing banner_video: ${setting.value}`);
            setting.value = `music/${setting.value}`;
            await setting.save();
            console.log(`Fixed to: ${setting.value}`);
        } else {
            console.log("banner_video not found or already fixed.");
        }

    } catch (e) {
        console.error("Error:", e);
    }
};

run();
