const http = require('http');
const { initDb, Track } = require('./src/database');

async function testStream() {
    await initDb();
    const track = await Track.findOne();
    if (!track) {
        console.log("No tracks found to test.");
        return;
    }

    console.log(`Testing stream for Track ID: ${track.id} (${track.title})`);
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: `/api/music/stream/${track.id}`,
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

        let dataReceived = 0;
        res.on('data', (chunk) => {
            dataReceived += chunk.length;
            // Abort early to save time
            if (dataReceived > 1000) {
                req.destroy();
            }
        });

        res.on('end', () => {
            console.log(`Stream started successfully. Data received (partial): ${dataReceived} bytes.`);
        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    req.end();
}

testStream();
