const http = require('http');

const lanIp = '192.168.1.113'; // Use the IP visible in previous logs
const port = 3000;

console.log(`Testing access via ${lanIp}:${port}...`);

const req = http.get(`http://${lanIp}:${port}/api/music`, (res) => {
    console.log(`Response Status: ${res.statusCode}`);
    res.resume();
});

req.on('error', (e) => {
    console.error(`Error connecting to ${lanIp}: ${e.message}`);
});

req.setTimeout(5000, () => {
    console.error('Request timed out');
    req.abort();
});
