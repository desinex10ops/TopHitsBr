
async function testPlaylist() {
    const API_URL = 'http://localhost:3000/api';

    try {
        // 1. Test Auto Playlists
        console.log('1. Testing Get Auto Playlists...');
        const res = await fetch(`${API_URL}/playlists`);
        const text = await res.text();
        try {
            const data = JSON.parse(text);
            if (!res.ok) throw new Error(data.error || text);
            console.log(`✅ Auto Playlists: Found ${data.length} types.`);
        } catch (e) {
            console.error('❌ JSON Parse Error. Response was:', text.substring(0, 200));
            throw e;
        }

        // 2. Test Get Random Playlist Tracks
        console.log('2. Testing Get "Random" Playlist Tracks...');
        const randomRes = await fetch(`${API_URL}/playlists/random`);
        const randomData = await randomRes.json();
        if (!randomRes.ok) throw new Error(randomData.error);
        console.log(`✅ Random Tracks: Found ${randomData.length} tracks.`);

        // 3. Login to test User Playlists
        console.log('3. Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test_refactor_1770939911756@example.com', password: 'password123' })
            // Using user created in previous test. If deleted, this will fail, but assuming persistence for now.
            // If fail, we register a new one.
        });

        let token;
        if (!loginRes.ok) {
            console.log('   Login failed, registering new user...');
            const regRes = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Playlist Tester',
                    email: `playlist_test_${Date.now()}@example.com`,
                    password: 'password123'
                })
            });
            const regData = await regRes.json();
            token = regData.token;
        } else {
            const loginData = await loginRes.json();
            token = loginData.token;
        }

        // 4. Create User Playlist
        console.log('4. Creating User Playlist...');
        const createRes = await fetch(`${API_URL}/playlists`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: 'Minha Playlist Refatorada' })
        });
        const createData = await createRes.json();
        if (!createRes.ok) throw new Error(createData.error);
        console.log(`✅ Playlist Created: ${createData.name} (ID: ${createData.id})`);

        // 5. Get User Playlists
        console.log('5. Getting User Playlists...');
        const listRes = await fetch(`${API_URL}/playlists/user`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const listData = await listRes.json();
        if (!listRes.ok) throw new Error(listData.error);
        console.log(`✅ User Playlists: Found ${listData.length} playlists.`);

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    }
}

testPlaylist();
