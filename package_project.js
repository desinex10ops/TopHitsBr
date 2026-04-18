const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function createProjectZip() {
    const output = fs.createWriteStream(path.join(__dirname, 'TopHitsBr_v1_Build.zip'));
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => console.log('Project ZIP created: ' + archive.pointer() + ' total bytes'));
    archive.on('error', (err) => { throw err; });

    archive.pipe(output);

    // Add server folder (excluding node_modules and storage)
    archive.glob('**/*', {
        cwd: path.join(__dirname, 'server'),
        ignore: ['node_modules/**', 'storage/**', 'database.sqlite']
    }, { prefix: 'server' });

    // Add client folder (excluding node_modules)
    // Actually, maybe just add the production build 'dist'?
    archive.glob('**/*', {
        cwd: path.join(__dirname, 'client/dist')
    }, { prefix: 'production_build' });

    // Add root files
    archive.file('package.json', { name: 'package.json' });
    archive.file('.gitignore', { name: '.gitignore' });

    await archive.finalize();
}

createProjectZip();
