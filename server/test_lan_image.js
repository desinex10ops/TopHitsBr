const http = require('http');

const lanIp = '192.168.1.113';
const port = 3000;
const imagePath = 'storage/covers/1770422026335-586813032.png'; // Known existing file

console.log(`Testing Image access via http://${lanIp}:${port}/${imagePath}...`);

const req = http.get(`http://${lanIp}:${port}/${imagePath}`, (res) => {
    console.log(`Response Status: ${res.statusCode}`);
    console.log(`Content-Type: ${res.headers['content-type']}`);
    console.log(`Content-Length: ${res.headers['content-length']}`);
    res.resume();
});

req.on('error', (e) => {
    console.error(`Error connecting to ${lanIp}: ${e.message}`);
});
