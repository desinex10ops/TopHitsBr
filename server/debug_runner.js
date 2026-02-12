const fs = require('fs');
const path = require('path');
const util = require('util');

const logPath = path.join(__dirname, 'startup_error.txt');

console.log('--- Debug Runner Starting ---');
try {
    // Redirect stderr to file
    const logFile = fs.createWriteStream(logPath, { flags: 'w' });
    const logStdout = process.stdout;

    console.error = function (d) { //
        logFile.write(util.format(d) + '\n');
        logStdout.write(util.format(d) + '\n');
    };

    // Try to load the main application
    require('./index.js');
    console.log('Index.js loaded successfully. Waiting for events...');

} catch (err) {
    const errorMsg = `CRITICAL STARTUP ERROR:\n${err.message}\n${err.stack}\n`;
    console.error(errorMsg);
    fs.writeFileSync(logPath, errorMsg);
}

process.on('uncaughtException', (err) => {
    const errorMsg = `UNCAUGHT EXCEPTION:\n${err.message}\n${err.stack}\n`;
    console.error(errorMsg);
    fs.appendFileSync(logPath, errorMsg);
});

process.on('unhandledRejection', (reason, promise) => {
    const errorMsg = `UNHANDLED REJECTION:\n${reason}\n`;
    console.error(errorMsg);
    fs.appendFileSync(logPath, errorMsg);
});
