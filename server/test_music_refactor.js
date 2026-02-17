
async function testMusic() {
    const API_URL = 'http://localhost:3000/api/music';

    // We assume the server is running and we can just GET public routes.
    // Uploading requires a valid token and multipart form data, which is complex to script with native fetch in a simple node script without boundaries.
    // So we will verify the GET routes which confirm that the Controller -> Service -> Repo -> DB flow is working for reading.

    try {
        console.log('1. Testing Get All Tracks...');
        const res = await fetch(`${API_URL}/`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error);
        console.log(`✅ Get All Tracks Success: Found ${data.length} tracks.`);

        console.log('2. Testing Get Genres...');
        const genreRes = await fetch(`${API_URL}/genres`);
        const genreData = await genreRes.json();

        if (!genreRes.ok) throw new Error(genreData.error);
        console.log(`✅ Get Genres Success: Found ${genreData.length} genres.`);

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
    }
}

testMusic();
