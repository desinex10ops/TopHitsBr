
try {
    const fs = require('fs');
    const path = require('path');

    const source = 'C:\\projetos\\TopHitsBr\\client\\public\\assets\\bg-site.png';
    const destDir = 'C:\\projetos\\TopHitsBr\\client\\src\\assets';
    const dest = path.join(destDir, 'bg-site.png');

    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(source, dest);
    console.log('File copied to src/assets/bg-site.png');
} catch (e) {
    console.error(e);
}
