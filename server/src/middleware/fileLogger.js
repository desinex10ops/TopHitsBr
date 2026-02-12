const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '../debug.log');

const fileLogger = (err, req, res, next) => {
    const timestamp = new Date().toISOString();
    const log = `[${timestamp}] ${err.message}\nStack: ${err.stack}\n\n`;

    fs.appendFile(logPath, log, (e) => {
        if (e) console.error("Erro ao escrever log:", e);
    });

    next(err);
};

module.exports = fileLogger;
