import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Auth.module.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard'); // Redirecionar para Dashboard
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Falha ao fazer login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.authCard}>
                <span className={styles.logo}>TopHitsBR</span>
                <h2 className={styles.title}>Entrar no TopHitsBR</h2>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email ou nome de usuário</label>
                        <input
                            type="email"
                            className={styles.input}
                            placeholder="Email ou nome de usuário"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Senha</label>
                        <input
                            type="password"
                            className={styles.input}
                            placeholder="Senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                        <Link to="/forgot-password" className={styles.link} style={{ fontSize: '0.9rem', color: '#b3b3b3' }}>
                            Esqueceu sua senha?
                        </Link>
                    </div>
                </form>

                <div className={styles.divider}>
                    <span>OU</span>
                </div>

                <div className={styles.socialLogin}>
                    <button className={`${styles.socialBtn} ${styles.google}`}>
                        <span>G</span> Continuar com Google
                    </button>
                    <button className={`${styles.socialBtn} ${styles.facebook}`}>
                        <span>f</span> Continuar com Facebook
                    </button>
                </div>

                <div className={styles.footer}>
                    Não tem uma conta? <Link to="/register" className={styles.link}>Inscrever-se</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
