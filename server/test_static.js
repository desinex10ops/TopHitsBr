const http = require('http');
const fs = require('fs');
const path = require('path');

const storagePath = path.join(__dirname, 'storage');
const files = fs.readdirSync(storagePath);
console.log('Files in storage root:', files);

// Find a file to test
let testFile = null;
function findFile(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isFile() && (item.endsWith('.jpg') || item.endsWith('.png') || item.endsWith('.mp3'))) {
            return path.relative(storagePath, fullPath).replace(/\\/g, '/');
        } else if (stat.isDirectory()) {
            const found = findFile(fullPath);
            if (found) return found;
        }
    }
    return null;
}

testFile = findFile(storagePath);

if (testFile) {
    console.log(`Testing access to: ${testFile}`);
    const url = `http://localhost:3000/storage/${testFile}`;
    http.get(url, (res) => {
        console.log(`StatusCode: ${res.statusCode}`);
        console.log(`ContentType: ${res.headers['content-type']}`);
        console.log(`ContentLength: ${res.headers['content-length']}`);
    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
    });
} else {
    console.log('No suitable file found to test.');
}
