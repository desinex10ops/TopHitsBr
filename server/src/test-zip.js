const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

const testZipPath = path.join(__dirname, 'test.zip'); // Vou precisar criar um zip fake ou usar um existente
const tempDir = path.join(__dirname, '../../storage/temp', 'test_debug');

if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

console.log('Testing ZIP extraction...');
try {
    // Criar um zip de teste se não existir
    if (!fs.existsSync(testZipPath)) {
        console.log('Creating dummy zip...');
        const zip = new AdmZip();
        zip.addFile("test.txt", Buffer.from("inner content"));
        zip.writeZip(testZipPath);
    }

    const zip = new AdmZip(testZipPath);
    zip.extractAllTo(tempDir, true);
    console.log('ZIP Extraction Success!');
    console.log('Files:', fs.readdirSync(tempDir));
} catch (e) {
    console.error('ZIP Error:', e);
}

// Limpeza
try {
    // fs.rmSync(tempDir, { recursive: true, force: true });
    // fs.unlinkSync(testZipPath);
} catch (e) { }
