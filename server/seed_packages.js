const { sequelize, CreditPackage } = require('./src/database');

async function seedPackages() {
    console.log('Seed: Criando pacotes de créditos padrão...');

    try {
        await sequelize.authenticate();

        const packages = [
            { name: 'Bronze', credits: 10, price: 9.90, description: 'Ótimo para começar' },
            { name: 'Prata', credits: 25, price: 19.90, description: 'O mais popular' },
            { name: 'Ouro', credits: 60, price: 39.90, description: 'Melhor custo-benefício' },
            { name: 'Diamante', credits: 150, price: 89.90, description: 'Para grandes produtores' }
        ];

        for (const pkg of packages) {
            await CreditPackage.findOrCreate({
                where: { name: pkg.name },
                defaults: pkg
            });
        }

        console.log('Seed concluído com sucesso!');
    } catch (error) {
        console.error('Erro no seed:', error);
    } finally {
        await sequelize.close();
    }
}

seedPackages();
