import axios from 'axios';

const getBaseUrl = () => {
    const { hostname } = window.location;
    // Se estiver rodando localmente (localhost ou IP local), assume porta 3000
    if (hostname === 'localhost' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
        return `http://${hostname}:3000/api`;
    }
    // Produção (ex: tophitsbr.com)
    return '/api';
};

const api = axios.create({
    baseURL: getBaseUrl(),
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
