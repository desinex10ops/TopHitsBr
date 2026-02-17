import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Auth.module.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        type: 'listener', // 'listener' | 'artist'
        artisticName: '',
        terms: false
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTypeChange = (type) => {
        setFormData(prev => ({ ...prev, type }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('As senhas não coincidem.');
        }

        if (!formData.terms) {
            return setError('Você precisa aceitar os termos.');
        }

        if (formData.type === 'artist' && !formData.artisticName) {
            return setError('Nome Artístico é obrigatório para artistas.');
        }

        setLoading(true);

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                type: formData.type,
                artisticName: formData.artisticName
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Falha no cadastro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.authCard}>
                <span className={styles.logo}>TopHitsBR</span>
                <h2 className={styles.title}>Inscreva-se grátis</h2>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Qual o seu perfil?</label>
                        <div className={styles.radioGroup}>
                            <label
                                className={`${styles.radioLabel} ${formData.type === 'listener' ? styles.active : ''}`}
                                onClick={() => handleTypeChange('listener')}
                            >
                                <input type="radio" name="type" value="listener" className={styles.radioInput} readOnly checked={formData.type === 'listener'} />
                                🎧 Ouvinte
                            </label>
                            <label
                                className={`${styles.radioLabel} ${formData.type === 'artist' ? styles.active : ''}`}
                                onClick={() => handleTypeChange('artist')}
                            >
                                <input type="radio" name="type" value="artist" className={styles.radioInput} readOnly checked={formData.type === 'artist'} />
                                🎤 Artista
                            </label>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nome Completo</label>
                        <input
                            type="text"
                            name="name"
                            className={styles.input}
                            placeholder="Seu nome"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {formData.type === 'artist' && (
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Nome Artístico / DJ</label>
                            <input
                                type="text"
                                name="artisticName"
                                className={styles.input}
                                placeholder="Nome artístico"
                                value={formData.artisticName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            name="email"
                            className={styles.input}
                            placeholder="Seu melhor email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Senha</label>
                        <input
                            type="password"
                            name="password"
                            className={styles.input}
                            placeholder="Crie uma senha"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Confirmar Senha</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className={styles.input}
                            placeholder="Confirme a senha"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.checkboxGroup}>
                        <input
                            type="checkbox"
                            name="terms"
                            id="terms"
                            checked={formData.terms}
                            onChange={handleChange}
                            required
                        />
                        <label htmlFor="terms">Li e concordo com os Termos e Condições e Política de Privacidade.</label>
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Criando Conta...' : 'Inscrever-se'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Já tem uma conta? <Link to="/login" className={styles.link}>Faça login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
