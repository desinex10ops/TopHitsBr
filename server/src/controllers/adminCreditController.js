const { CreditPackage, SystemSetting } = require('../database');

exports.getPackages = async (req, res) => {
    try {
        const packages = await CreditPackage.findAll({ order: [['price', 'ASC']] });
        res.json(packages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar pacotes.' });
    }
};

exports.createPackage = async (req, res) => {
    try {
        const { name, credits, price, description, active } = req.body;
        const newPackage = await CreditPackage.create({ name, credits, price, description, active });
        res.status(201).json(newPackage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar pacote.' });
    }
};

exports.updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, credits, price, description, active } = req.body;

        const pkg = await CreditPackage.findByPk(id);
        if (!pkg) return res.status(404).json({ error: 'Pacote não encontrado.' });

        await pkg.update({ name, credits, price, description, active });
        res.json(pkg);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar pacote.' });
    }
};

exports.deletePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const pkg = await CreditPackage.findByPk(id);
        if (!pkg) return res.status(404).json({ error: 'Pacote não encontrado.' });

        await pkg.destroy();
        res.json({ message: 'Pacote removido.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao remover pacote.' });
    }
};

exports.getGlobalSettings = async (req, res) => {
    try {
        // Fetch specific credit settings
        const settings = await SystemSetting.findAll({
            where: {
                key: ['cost_boost_track', 'cost_boost_album', 'cost_highlight']
            }
        });

        // Default values
        const defaults = {
            cost_boost_track: 3,
            cost_boost_album: 8,
            cost_highlight: 5
        };

        const result = { ...defaults };
        settings.forEach(s => result[s.key] = parseInt(s.value));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar configurações de créditos.' });
    }
};
