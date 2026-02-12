const { Boost, Op } = require('../database');

/**
 * Smart Boost Engine 🤖
 * Responsável por otimizar campanhas e garantir entrega de visualizações.
 */
class SmartBoostEngine {

    // Inicia o cron job (simulado com setInterval)
    startScheduler() {
        console.log("🤖 Smart Boost Engine iniciado...");

        // Rodar a cada 60 segundos para testes (em prod seria a cada hora)
        setInterval(() => {
            this.optimizeCampaigns();
        }, 60 * 1000);
    }

    async optimizeCampaigns() {
        try {
            const now = new Date(); // timestamp

            // 1. Buscar Campanhas Ativas
            const activeBoosts = await Boost.findAll({
                where: {
                    status: 'active',
                    endDate: { [Op.gt]: now }
                }
            });

            if (activeBoosts.length === 0) return;

            console.log(`🤖 Otimizando ${activeBoosts.length} campanhas...`);

            for (const boost of activeBoosts) {
                // 2. Calcular Progresso do Tempo
                const totalDurationMs = new Date(boost.endDate) - new Date(boost.startDate);
                const elapsedMs = now - new Date(boost.startDate);
                const timeProgress = elapsedMs / totalDurationMs; // 0.0 a 1.0

                // 3. Calcular Progresso da Meta (Impressões)
                // Evitar divisão por zero
                const target = boost.targetImpressions || 1;
                const impressionProgress = boost.impressions / target;

                // 4. Lógica de Otimização (Smart Boost)
                let needsBoost = false;
                let multiplier = 1.0;

                // Se o tempo passou mais que o progresso das impressões (com margem de 10%)
                if (timeProgress > (impressionProgress + 0.1)) {
                    needsBoost = true;
                    // Calcular urgência: quanto mais atrasado, maior o multiplier
                    // Ex: Tempo 0.5, Impr 0.2 -> Gap 0.3 -> Multiplier maior
                    const gap = timeProgress - impressionProgress;
                    multiplier = 1 + (gap * 2); // Pode dobrar o score se estiver muito atrasado
                }

                // 5. Atualizar Score e Flag
                let newScore = boost.baseScore * multiplier;

                // Bônus se for Premium (garantia mais forte)
                if (boost.tier === 'premium' && needsBoost) {
                    newScore *= 1.2;
                }

                // Atualizar DB apenas se mudou algo significativo
                if (boost.smartBoostActive !== needsBoost || Math.abs(boost.currentScore - newScore) > 1) {
                    await boost.update({
                        smartBoostActive: needsBoost,
                        currentScore: newScore
                    });
                    if (needsBoost) {
                        console.log(`🚀 Smart Boost ativado para #${boost.id} (${boost.targetName}) - Score: ${newScore.toFixed(0)}`);
                    }
                }
            }

        } catch (error) {
            console.error("Erro no Smart Boost Engine:", error);
        }
    }
}

module.exports = new SmartBoostEngine();
