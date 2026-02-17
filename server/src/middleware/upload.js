const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garantir que diretórios existam
// __dirname é src/config. Subir 2 níveis para server.
const storageRoot = path.resolve(__dirname, '../../storage');
const uploadDir = path.join(storageRoot, 'music');
const coverDir = path.join(storageRoot, 'covers');

if (!fs.existsSync(storageRoot)) fs.mkdirSync(storageRoot, { recursive: true });
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(coverDir)) fs.mkdirSync(coverDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'cover') {
            cb(null, coverDir);
        } else {
            cb(null, uploadDir);
        }
    },
    filename: (req, file, cb) => {
        // Nome único: timestamp-nomeoriginal
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2048 * 1024 * 1024 }, // 2GB limite
    fileFilter: (req, file, cb) => {
        console.log(`[Upload] Recebido: ${file.originalname} | Mime: ${file.mimetype}`);

        if (file.fieldname === 'audio' || file.fieldname === 'karaoke') {
            const isAudio = file.mimetype.startsWith('audio/') ||
                file.mimetype === 'application/octet-stream';

            // Verificação extra de extensão
            const ext = path.extname(file.originalname).toLowerCase();
            const validExts = ['.mp3', '.wav', '.ogg', '.m4a'];

            if (!isAudio && !validExts.includes(ext)) {
                return cb(new Error(`Arquivo de áudio inválido: ${file.mimetype}`));
            }
        }

        if (file.fieldname === 'file') {
            const ext = path.extname(file.originalname).toLowerCase();
            const validExts = ['.zip', '.rar', '.7z'];

            if (!validExts.includes(ext)) {
                return cb(new Error('Apenas arquivos compactados (.zip, .rar, .7z) são permitidos para álbuns!'));
            }
        }

        // New field for settings uploads (Images & Videos)
        if (file.fieldname === 'settingFile') {
            const isImage = file.mimetype.startsWith('image/');
            const isVideo = file.mimetype.startsWith('video/');
            const ext = path.extname(file.originalname).toLowerCase();
            const validVideoExts = ['.mp4', '.webm', '.ogg', '.mov'];

            if (!isImage && !isVideo && !validVideoExts.includes(ext)) {
                return cb(new Error('Apenas imagens e vídeos são permitidos para configurações!'));
            }
        }


        if (file.fieldname === 'cover' && !file.mimetype.startsWith('image/')) {
            return cb(new Error('Apenas imagens são permitidas para capa!'));
        }

        if ((file.fieldname === 'avatar' || file.fieldname === 'banner') && !file.mimetype.startsWith('image/')) {
            return cb(new Error('Apenas imagens são permitidas para avatar e banner!'));
        }

        if (file.fieldname === 'bannerVideo') {
            const isVideo = file.mimetype.startsWith('video/');
            const ext = path.extname(file.originalname).toLowerCase();
            const validVideoExts = ['.mp4', '.webm', '.ogg', '.mov'];

            if (!isVideo && !validVideoExts.includes(ext)) {
                return cb(new Error('Apenas arquivos de vídeo são permitidos para o banner!'));
            }
        }

        cb(null, true);
    }
});

module.exports = upload;
