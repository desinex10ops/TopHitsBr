/**
 * Utility to generate the full URL for storage assets.
 * Handles both local development (localhost/IP) and production environments.
 * 
 * @param {string} path - The relative path to the asset in storage (e.g., 'covers/album.jpg')
 * @returns {string|null} - The full URL or null if path is invalid
 */
export const getStorageUrl = (path) => {
    if (!path) return null;

    // Se já for uma URL completa (ex: link externo), retorna ela mesma
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    const { hostname, protocol } = window.location;
    const PORT = 3000; // Porta do backend no ambiente de desenvolvimento

    // Normalizar barras invertidas (Windows) para barras normais
    let normalizedPath = path.replace(/\\/g, '/');

    // Remover barra inicial se houver
    if (normalizedPath.startsWith('/')) {
        normalizedPath = normalizedPath.substring(1);
    }

    // Remover prefixo "storage/" se já estiver incluído no path (evitar duplicidade)
    if (normalizedPath.startsWith('storage/')) {
        normalizedPath = normalizedPath.substring(8); // 'storage/'.length === 8
    }

    // Detectar ambiente de desenvolvimento (Localhost ou IP de rede local)
    const isDev = hostname === 'localhost' || hostname.startsWith('192.168.') || hostname.startsWith('10.');

    if (isDev) {
        return `${protocol}//${hostname}:${PORT}/storage/${encodeURI(normalizedPath)}`;
    }

    // Produção (O Nginx deve servir /storage na mesma origem do frontend)
    return `/storage/${encodeURI(normalizedPath)}`;
};
