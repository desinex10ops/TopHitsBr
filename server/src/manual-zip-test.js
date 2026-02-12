const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

// Path to a test zip file (replace with actual path if available, or create dummy)
const testZipPath = path.join(__dirname, 'test_manual.zip');
const tempDir = path.join(__dirname, '../../storage/temp', 'test_debug_manual');

if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

console.log('--- Manual Extraction Test Start ---');
console.log(`Temp Dir: ${tempDir}`);

try {
    // Create a dummy zip if it doesn't exist to test basic functionality
    if (!fs.existsSync(testZipPath)) {
        console.log('Creating dummy zip for test...');
        const zip = new AdmZip();
        zip.addFile("test.txt", Buffer.from("inner content"));
        zip.writeZip(testZipPath);
    }

    console.log(`Processing ZIP: ${testZipPath}`);
    const zip = new AdmZip(testZipPath);

    console.log('Extracting...');
    zip.extractAllTo(tempDir, true);
    console.log('Extraction successful.');

    const files = fs.readdirSync(tempDir);
    console.log('Extracted files:', files);

} catch (e) {
    console.error('--- EXTRACTION FAILED ---');
    console.error('Error Name:', e.name);
    console.error('Error Message:', e.message);
    console.error('Stack:', e.stack);
}
console.log('--- Manual Extraction Test End ---');
