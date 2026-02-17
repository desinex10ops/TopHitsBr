
async function checkHealth() {
    const API_URL = 'http://localhost:3000/api';
    try {
        console.log('Checking /api/music/genres...');
        const res = await fetch(`${API_URL}/music/genres`);
        console.log(`Status: ${res.status}`);
        if (res.ok) {
            const data = await res.json();
            console.log(`✅ Server is UP. Genres found: ${data.length}`);
        } else {
            console.log(`❌ Server returned error: ${res.statusText}`);
        }
    } catch (e) {
        console.error(`❌ Server UNREACHABLE: ${e.message}`);
    }
}
checkHealth();
