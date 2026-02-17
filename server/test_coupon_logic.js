const API_URL = 'http://localhost:3000/api';
let token = '';

async function run() {
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'bruno@tophits.com.br', password: 'password123' })
        });

        let data = await loginRes.json();

        if (!loginRes.ok) {
            console.log('Login failed (' + loginRes.status + '), trying to register temp producer...');
            const regRes = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Test Producer',
                    email: 'test_producer_' + Date.now() + '@test.com',
                    password: 'password123',
                    type: 'artist'
                })
            });
            data = await regRes.json();
            if (!regRes.ok) throw new Error(JSON.stringify(data));
        }

        token = data.token;
        console.log('Logged in! Token:', token ? 'Yes' : 'No');

        const authHeaders = {
            'Content-Type': 'application/json',
            'x-auth-token': token
        };

        // 2. Create Coupon
        console.log('2. Creating Coupon...');
        const couponCode = 'TEST' + Date.now();
        const createRes = await fetch(`${API_URL}/marketing/coupons`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                code: couponCode,
                discountPercentage: 15,
                usageLimit: 10
            })
        });
        const coupon = await createRes.json();
        if (!createRes.ok) throw new Error(JSON.stringify(coupon));
        console.log('Coupon created:', coupon);

        // 3. Validate Coupon (Valid Scenario)
        console.log('3. Validating Coupon...');
        const validateRes = await fetch(`${API_URL}/marketing/coupons/validate`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                code: couponCode,
                totalValue: 100
            })
        });
        const validation = await validateRes.json();
        console.log('Validation Result:', validation);

        // 4. Delete Coupon
        console.log('4. Deleting Coupon...');
        const delRes = await fetch(`${API_URL}/marketing/coupons/${coupon.id}`, {
            method: 'DELETE',
            headers: authHeaders
        });
        console.log('Coupon deleted status:', delRes.status);

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

run();
