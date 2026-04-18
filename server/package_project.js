const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function createProjectZip() {
    const zipPath = path.join(__dirname, '../TopHitsBr_Completo.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => console.log('Project ZIP created: ' + archive.pointer() + ' total bytes at ' + zipPath));
    archive.on('error', (err) => { throw err; });

    archive.pipe(output);

    // Add server folder (excluding node_modules and storage)
    archive.glob('**/*', {
        cwd: __dirname,
        ignore: ['node_modules/**', 'storage/**', 'database.sqlite', 'TopHitsBr_Completo.zip']
    }, { prefix: 'server' });

    // Add client production build
    archive.glob('**/*', {
        cwd: path.join(__dirname, '../client/dist')
    }, { prefix: 'dist' });

    // Add root files
    archive.file(path.join(__dirname, '../client/package.json'), { name: 'client_package.json' });
    archive.file(path.join(__dirname, '../.gitignore'), { name: '.gitignore' });

    await archive.finalize();
}

createProjectZip();
