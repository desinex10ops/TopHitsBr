const { User, initDb } = require('./src/database');
const bcrypt = require('bcryptjs');

async function resetPassword() {
    await initDb();

    const email = 'marcelotemplates@gmail.com';
    const newPassword = '123456';

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log(`❌ Usuário não encontrado: ${email}`);
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        console.log(`✅ Senha resetada com sucesso para: ${email}`);
        console.log(`🔑 Nova senha: ${newPassword}`);

    } catch (error) {
        console.error("Erro ao resetar senha:", error);
    }
}

resetPassword();
