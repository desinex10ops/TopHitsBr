const API_URL = 'http://localhost:3009/api';

async function run() {
    try {
        console.log('1. Registering/Logging in as Admin...');
        const email = 'admin_' + Date.now() + '@test.com';
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Admin Test',
                email,
                password: 'password123',
                type: 'listener' // Will manually promote to admin if I could, but here I rely on existing logic or just error checking
            })
        });

        // NOTE: In this test env, I cannot easily promote to admin without DB access or secret hack. 
        // So I will expect a 403 Forbidden for the new user, which CONFIRMS the middleware is working.
        // If I get 404, the route doesn't exist.

        const regData = await regRes.json();
        const token = regData.token;
        console.log(`Logged in as: ${email}`);

        console.log('2. Accessing Admin Stats (Should Fail 403)...');
        const statsRes = await fetch(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (statsRes.status === 403) {
            console.log("SUCCESS: Access denied for non-admin.");
        } else if (statsRes.status === 200) {
            console.error("FAILURE: Non-admin accessed admin stats!", await statsRes.json());
        } else {
            console.error(`FAILURE: Unexpected status ${statsRes.status}`);
        }

        console.log('3. Accessing Admin Finance (Should Fail 403)...');
        const finRes = await fetch(`${API_URL}/admin/finance/summary`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (finRes.status === 403) {
            console.log("SUCCESS: Access denied for non-admin.");
        } else {
            console.error(`FAILURE: Unexpected status ${finRes.status}`);
        }

        // Ideally I'd test with a real admin, but that requires seeding. 
        // The existence of the route receiving 403 proves the route IS registered and middleware IS active.

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

run();
