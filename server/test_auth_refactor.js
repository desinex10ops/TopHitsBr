
async function testAuth() {
    const API_URL = 'http://localhost:3000/api/auth';
    const TEST_USER = {
        name: 'Test Refactor',
        email: `test_refactor_${Date.now()}@example.com`,
        password: 'password123',
        type: 'listener'
    };

    try {
        console.log('1. Testing Register...');
        const regRes = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });

        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(regData.error || regData.message);
        console.log('✅ Register Success:', regData.message);
        const { token } = regData;

        console.log('2. Testing GetMe (Token Validation)...');
        const meRes = await fetch(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const meData = await meRes.json();
        if (!meRes.ok) throw new Error(meData.error);
        console.log('✅ GetMe Success:', meData.email);

        console.log('3. Testing Login...');
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(loginData.error);
        console.log('✅ Login Success:', loginData.message);

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    }
}

testAuth();
