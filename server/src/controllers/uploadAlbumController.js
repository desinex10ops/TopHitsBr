const { Track, Album } = require('../database');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
// const unrar = require('node-unrar-js'); // Reservado para futuro se ZIP nÃ£o for suficiente
const mm = require('music-metadata');

// Função auxiliar para sanitizar nomes de arquivos e pastas
const sanitizeName = (name) => {
    return name.replace(/[^a-zA-Z0-9 \-\(\)\.]/g, '').trim();
};

exports.previewAlbum = async (req, res) => {
    console.log('[Preview Controller] Recebida nova requisição de análise.');
    try {
        const zipFile = req.files['file'] ? req.files['file'][0] : null;

        if (!zipFile) {
            return res.status(400).json({ error: 'Arquivo ZIP é obrigatório.' });
        }

        // 1. Preparar Pasta Temporária Única
        const tempId = `${Date.now()}`;
        const tempDir = path.join(__dirname, '../../storage/temp', tempId);
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        // 2. Garantir Extensão Correta para Extração (Multer salva sem ext)
        const ext = path.extname(zipFile.originalname).toLowerCase();
        const tempZipPath = path.join(tempDir, `upload_temp${ext}`);

        // Mover/Renomear arquivo do multer para dentro da pasta temp com extensão
        try {
            fs.copyFileSync(zipFile.path, tempZipPath);
            fs.unlinkSync(zipFile.path); // Remove original do temp do sistema
            console.log(`[Preview] Arquivo copiado para: ${tempZipPath}`);
        } catch (moveErr) {
            console.error('[Preview] Erro ao mover arquivo:', moveErr);
            throw new Error('Falha ao processar arquivo enviado (permissão ou disco).');
        }

        if (ext === '.rar') {
            try {
                console.log('[RAR] Iniciando extração...');
                const unrar = await import('node-unrar-js');
                const createExtractorFromFile = unrar.createExtractorFromFile;
                const extractor = await createExtractorFromFile({
                    filepath: tempZipPath,
                    targetPath: tempDir
                });
                const result = extractor.extract();
                for (const file of result.files) { /* Trigger extraction */ }
                console.log('[RAR] Extração concluída.');
            } catch (rarErr) {
                console.error('[RAR] Erro fatal:', rarErr);
                throw new Error(`Falha RAR: ${rarErr.message}`);
            }
        } else {
            try {
                console.log('[ZIP] Iniciando extração com adm-zip...');
                const zip = new AdmZip(tempZipPath);
                zip.extractAllTo(tempDir, true);
                console.log('[ZIP] Extração concluída.');
            } catch (zipErr) {
                console.error('[ZIP] Erro fatal:', zipErr);
                throw new Error('Arquivo ZIP corrompido ou inválido.');
            }
        }

        // Remover o arquivo compactado após extração para não aparecer na lista
        try { fs.unlinkSync(tempZipPath); } catch (e) { }

        // 3. Listar Arquivos para Preview
        // 3. Listar Arquivos para Preview (Recursivo para pegar subpastas)
        const getAllFiles = (dirPath, arrayOfFiles, relDir = '') => {
            const files = fs.readdirSync(dirPath);
            arrayOfFiles = arrayOfFiles || [];

            files.forEach(function (file) {
                if (fs.statSync(dirPath + "/" + file).isDirectory()) {
                    arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles, path.join(relDir, file));
                } else {
                    arrayOfFiles.push({
                        fullPath: path.join(dirPath, file),
                        relativePath: path.join(relDir, file)
                    });
                }
            });
            return arrayOfFiles;
        };

        console.log('[Preview] Listando arquivos recursivamente...');
        const allFiles = getAllFiles(tempDir, []);
        console.log(`[Preview] Total arquivos encontrados: ${allFiles.length}`);

        const previewTracks = [];

        for (const fileObj of allFiles) {
            const file = fileObj.relativePath; // Caminho relativo para ID/Display
            const fullPath = fileObj.fullPath;

            if (file.startsWith('.') || file.includes('__MACOSX')) continue;

            const fileExt = path.extname(fullPath).toLowerCase();
            if (['.mp3', '.wav', '.ogg', '.m4a'].includes(fileExt)) {
                try {
                    const metadata = await mm.parseFile(fullPath);
                    const title = metadata.common.title || path.basename(file, fileExt);

                    previewTracks.push({
                        filename: file, // Guardar caminho relativo para o confirm achar
                        title: title,
                        selected: true
                    });
                } catch (err) {
                    console.error(`Erro metadata ${file}`, err);
                    previewTracks.push({ filename: file, title: path.basename(file, fileExt), selected: true });
                }
            }
        }

        console.log(`[Preview] Total faixas áudio identificadas: ${previewTracks.length}`);

        if (previewTracks.length === 0) {
            console.warn('[Preview] Nenhuma faixa de áudio encontrada no ZIP.');
            // Não jogar erro, retornar vazio para o usuário ver que não achou nada
        }

        // Salvar capa se enviada (temporariamente no tempDir ou manter no multer?)
        // O Multer já salvou a capa em algum lugar temporário, mas precisamos dela no confirm.
        // Vamos ignorar a capa no preview e pedir para reenviar ou (melhor) salvar metadata.
        // Simplificação: O frontend manda a capa DE NOVO no confirm ou salvamos ela no tempDir.
        if (req.files['cover']) {
            const coverFile = req.files['cover'][0];
            const tempCoverPath = path.join(tempDir, 'cover_temp' + path.extname(coverFile.originalname));
            fs.copyFileSync(coverFile.path, tempCoverPath);
        }

        res.json({
            tempId: tempId,
            tracks: previewTracks
        });

    } catch (error) {
        const logPath = path.join(__dirname, '../../storage/debug_error.log');
        const logMsg = `\n[${new Date().toISOString()}] PREVIEW ERROR:\nMessage: ${error.message}\nStack: ${error.stack}\n`;
        try { fs.appendFileSync(logPath, logMsg); } catch (e) { console.error("Falha ao escrever log:", e); }

        console.error("Erro Preview Detalhado:", error);
        console.error("Stack:", error.stack);
        res.status(500).json({ error: error.message || "Erro desconhecido no processamento do ZIP." });
    }
};

exports.confirmAlbum = async (req, res) => {
    try {
        const { tempId, tracks, defaultArtist, defaultAlbumName, defaultGenre, defaultVibe,
            defaultComposer, defaultInstagram, defaultYoutubeLink, defaultIsExplicit } = req.body;

        // Tracks vem como JSON string se usar FormData, ou objeto direto se JSON body.
        // Como vamos mandar capa, provavelmente será FormData.
        const tracksList = typeof tracks === 'string' ? JSON.parse(tracks) : tracks;

        const tempDir = path.join(__dirname, '../../storage/temp', tempId);
        if (!fs.existsSync(tempDir)) {
            return res.status(404).json({ error: 'Sessão de upload expirada ou inválida.' });
        }

        const storageBase = path.join(__dirname, '../../storage');
        const processedTracks = [];

        // Recuperar Capa Temporária se existir
        let globalCoverPath = null;
        // Tentar achar qualquer arquivo cover_temp.*
        const tempFiles = fs.readdirSync(tempDir);
        const coverTempFile = tempFiles.find(f => f.startsWith('cover_temp'));

        if (coverTempFile) {
            const coverExt = path.extname(coverTempFile);
            const artistFolder = sanitizeName(defaultArtist || 'Unknown');
            const albumFolder = sanitizeName(defaultAlbumName || 'Unknown');
            const targetDir = path.join(storageBase, artistFolder, albumFolder);
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

            const targetCoverPath = path.join(targetDir, 'cover' + coverExt);
            fs.copyFileSync(path.join(tempDir, coverTempFile), targetCoverPath);
            globalCoverPath = path.relative(storageBase, targetCoverPath).replace(/\\/g, '/');
        }

        // [FIX] CRIAR REGISTRO DO ÁLBUM
        const newAlbum = await Album.create({
            title: defaultAlbumName || 'Álbum Desconhecido',
            genre: defaultGenre || 'Outro',
            cover: globalCoverPath,
            description: `Álbum de ${defaultArtist || 'Desconhecido'}`,
            UserId: req.user ? req.user.id : null,
            releaseDate: new Date()
        });

        // Processar Faixas Aprovadas
        let trackIndex = 1;
        for (const trackInfo of tracksList) {
            // trackInfo: { filename, title, selected }
            if (!trackInfo.selected) continue;

            const sourcePath = path.join(tempDir, trackInfo.filename);
            if (!fs.existsSync(sourcePath)) continue;

            // Extrair metadata real para duração
            let duration = 0;
            try {
                const mmData = await mm.parseFile(sourcePath);
                duration = mmData.format.duration || 0;
            } catch (e) { }

            // Mover para destino final
            const ext = path.extname(trackInfo.filename);
            const artistClean = sanitizeName(defaultArtist || 'Unknown');
            const albumClean = sanitizeName(defaultAlbumName || 'Unknown');

            // Ensure unique filename to prevent overwriting tracks with identical metadata
            const trackClean = `${trackIndex.toString().padStart(2, '0')}_${sanitizeName(trackInfo.title)}${ext}`;
            trackIndex++;

            const finalDir = path.join(storageBase, artistClean, albumClean);
            if (!fs.existsSync(finalDir)) fs.mkdirSync(finalDir, { recursive: true });

            const finalPath = path.join(finalDir, trackClean);
            fs.renameSync(sourcePath, finalPath);

            const relativePath = path.relative(storageBase, finalPath).replace(/\\/g, '/');

            const newTrack = await Track.create({
                title: trackInfo.title,
                artist: defaultArtist || 'Desconhecido',
                album: defaultAlbumName || 'Álbum',
                genre: defaultGenre || 'Outro',
                vibe: defaultVibe || null,
                filepath: relativePath,
                coverpath: globalCoverPath,
                duration: duration,
                composer: defaultComposer || null,
                instagram: defaultInstagram || null,
                youtubeLink: defaultYoutubeLink || null,
                isExplicit: defaultIsExplicit === 'true' || defaultIsExplicit === true,
                UserId: req.user ? req.user.id : null, // Associar ao usuário logado
                AlbumId: newAlbum.id // [FIX] VINCULAR AO ÁLBUM CRIADO
            });
            processedTracks.push(newTrack);
        }

        // Limpar Temp
        fs.rmSync(tempDir, { recursive: true, force: true });

        res.json({ message: 'Álbum processado!', tracks: processedTracks, album: newAlbum });

    } catch (error) {
        console.error("Erro Confirm:", error);
        res.status(500).json({ error: error.message });
    }
};
