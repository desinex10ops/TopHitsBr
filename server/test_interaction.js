const { Boost, sequelize } = require('./src/database');

async function testInteraction() {
    try {
        await sequelize.authenticate();

        // Find an active boost
        const boost = await Boost.findOne({ where: { status: 'active' } });
        if (!boost) {
            console.log("No active boost found.");
            return;
        }

        console.log(`Boost ID: ${boost.id}, Clicks before: ${boost.clicks}, Plays before: ${boost.plays || 0}`);

        // Call API
        try {
            const response = await fetch('http://localhost:3000/api/boost/interaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    boostId: boost.id,
                    type: 'play'
                })
            });
            const data = await response.json();
            console.log("API response:", data);
        } catch (e) {
            console.error("API call failed:", e.message);
        }

        // Verify DB update
        const updatedBoost = await Boost.findByPk(boost.id);
        console.log(`Boost ID: ${boost.id}, Clicks after: ${updatedBoost.clicks}, Plays after: ${updatedBoost.plays}`);

    } catch (e) {
        console.error(e);
    }
}

testInteraction();
