const { initDb, Track } = require('./src/database');
const path = require('path');
const fs = require('fs');

async function check() {
    await initDb();
    const tracks = await Track.findAll();

    console.log('--- Diagnóstico de Arquivos ---');
    console.log(`Total de músicas: ${tracks.length}`);

    tracks.forEach(t => {
        console.log(`\nID: ${t.id} | Título: ${t.title}`);
        console.log(`Capa (DB): ${t.coverpath}`);

        if (t.coverpath) {
            const fullPath = path.join(__dirname, '../storage', t.coverpath);
            const exists = fs.existsSync(fullPath);
            console.log(`Caminho Completo: ${fullPath}`);
            console.log(`Arquivo existe? ${exists ? 'SIM' : 'NÃO'}`);
        } else {
            console.log('Sem capa cadastrada.');
        }
    });
}

check();
