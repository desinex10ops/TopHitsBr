
(async () => {
    try {
        console.log('--- Iniciando Teste de API Unrar ---');
        const unrar = await import('node-unrar-js');
        console.log('Exports do módulo:', Object.keys(unrar));

        if (unrar.createExtractorFromFile) {
            console.log('createExtractorFromFile é:', typeof unrar.createExtractorFromFile);
        } else {
            console.log('createExtractorFromFile NÃO encontrado');
        }

        // Tentar criar um dummy extractor se possível, ou apenas verificar protótipos
        console.log('--- Fim do Teste ---');
    } catch (e) {
        console.error('Erro no script:', e);
    }
})();
