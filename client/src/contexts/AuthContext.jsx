import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

console.log("Arquivo AuthContext carregado - VERSAO FIXED");
console.log("Usando Named Imports");
// Provider Component

export const AuthProvider = ({ children }) => {
    console.log("Rendering AuthProvider");

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                // Configurar header padrão
                api.defaults.headers.common['x-auth-token'] = token;
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                } catch (error) {
                    console.error("Erro ao carregar usuário", error);
                    logout();
                }
            }
            setLoading(false);
        };
        loadUser();
        // Safety timeout in case server is dead
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user } = res.data;

        localStorage.setItem('token', token);
        api.defaults.headers.common['x-auth-token'] = token;
        setUser(user);
        return user;
    };

    const register = async (userData) => {
        const res = await api.post('/auth/register', userData);
        const { token, user } = res.data;

        localStorage.setItem('token', token);
        api.defaults.headers.common['x-auth-token'] = token;
        setUser(user);
        return user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['x-auth-token'];
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {console.log("AuthProvider rendering children, loading:", loading)}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000', color: '#1DB954' }}>
                    <h2>Carregando...</h2>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

