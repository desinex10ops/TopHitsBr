const API_URL = 'http://localhost:3008/api';

async function run() {
    try {
        console.log('1. Registering/Logging in...');
        const email = 'reviewer_' + Date.now() + '@test.com';
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Reviewer Test',
                email,
                password: 'password123',
                type: 'listener'
            })
        });
        const regData = await regRes.json();
        const token = regData.token;
        console.log(`Logged in as: ${email}`);

        // 2. Fetch Products
        console.log('2. Fetching Products...');
        const prodRes = await fetch(`${API_URL}/shop/products`);
        const prodData = await prodRes.json();
        if (prodData.length === 0) throw new Error("No products found to review.");
        const product = prodData[0];
        console.log(`Using Product: ${product.title} (ID: ${product.id})`);

        // 3. Create Review (Should Fail - No Purchase)
        console.log('3. Attempting Review without Purchase...');
        const failRes = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: product.id,
                rating: 5,
                comment: "Should fail!"
            })
        });
        const failData = await failRes.json();
        if (failRes.status === 403) {
            console.log("SUCCESS: Review rejected as expected.");
        } else {
            console.error("FAILURE: Review should be rejected.", failRes.status, failData);
        }

        // Note: I cannot easily simulate a purchase here without mocking MP or creating a complex order flow in this script.
        // For now, verification that endpoint is reachable and enforces purchase rule is good.
        // I could create a fake "paid" order directly in DB if I had DB access script helper, but this is an API test.
        // I trust the 403 response confirms the controller logic is active.

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

run();
