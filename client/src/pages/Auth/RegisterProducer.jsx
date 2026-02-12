import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css'; // Reusing Auth styles

const RegisterProducer = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        type: 'artist', // Hardcoded to artist (Producer)
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('As senhas não coincidem.');
        }

        if (!formData.terms) {
            return setError('Você precisa aceitar os termos.');
        }

        if (!formData.artisticName) {
            return setError('Nome de Produtor/Loja é obrigatório.');
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
            // Redirect to dashboard or shop layout setup
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
                <h2 className={styles.title}>Cadastro de Produtor</h2>
                <p className={styles.subtitle}>Comece a vender seus beats e serviços hoje mesmo.</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nome da Loja / Produtor</label>
                        <input
                            type="text"
                            name="artisticName"
                            className={styles.input}
                            placeholder="Ex: DJ Cleiton Beats"
                            value={formData.artisticName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Nome Completo</label>
                        <input
                            type="text"
                            name="name"
                            className={styles.input}
                            placeholder="Seu nome real"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

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
                            placeholder="Crie uma senha forte"
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
                        <label htmlFor="terms">Li e concordo com os Termos de Produtor.</label>
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Criar Loja' : 'Cadastrar como Produtor'}
                    </button>
                </form>

                <div className={styles.footer}>
                    Já tem conta? <Link to="/login" className={styles.link}>Entrar</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterProducer;
