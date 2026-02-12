
try {
    require('adm-zip');
    console.log('adm-zip: OK');
} catch (e) {
    console.log('adm-zip: MISSING');
}

try {
    require('music-metadata');
    console.log('music-metadata: OK');
} catch (e) {
    console.log('music-metadata: MISSING');
}
