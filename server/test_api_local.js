const http = require('http');

console.log("Testing API /api/music...");

const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/music',
    method: 'GET'
}, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        console.log(`BODY LENGTH: ${data.length}`);
        if (data.length < 500) console.log(`BODY: ${data}`);
        console.log("No more data.");
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
