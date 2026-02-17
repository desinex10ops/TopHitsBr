async function testApi() {
    try {
        console.log("Fetching http://localhost:3000/api/music...");
        const res = await fetch('http://localhost:3000/api/music');
        console.log(`Status: ${res.status}`);
        if (res.ok) {
            const data = await res.json();
            console.log(`Tracks found: ${data.length}`);
            if (data.length > 0) {
                console.log("Sample Track:", JSON.stringify(data[0], null, 2));
            }
        } else {
            console.log("Error text:", await res.text());
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testApi();
