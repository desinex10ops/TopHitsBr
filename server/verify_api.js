const axios = require('axios');

const checkApi = async () => {
    try {
        console.log("Checking /api/music...");
        const musicRes = await axios.get('http://localhost:3000/api/music');
        console.log(`Music Status: ${musicRes.status}`);
        console.log(`Music Count: ${musicRes.data.length}`);
        if (musicRes.data.length > 0) {
            console.log("Sample Track:", musicRes.data[0].title);
        }

        console.log("\nChecking /api/settings...");
        const settingsRes = await axios.get('http://localhost:3000/api/settings').catch(e => ({ status: e.response?.status, error: e.message }));
        console.log(`Settings Status: ${settingsRes.status || settingsRes.error}`);

    } catch (error) {
        console.error("API Check Failed:", error.message);
        if (error.response) {
            console.error("Response Data:", error.response.data);
        }
    }
};

checkApi();
