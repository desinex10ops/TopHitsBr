import React from 'react';
import styles from './SmartInsights.module.css';
import { FiTrendingUp, FiClock, FiInstagram, FiVideo } from 'react-icons/fi';

const SmartInsights = () => {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.icon} style={{ background: '#E1306C' }}>
                    <FiInstagram />
                </div>
                <div className={styles.content}>
                    <strong>Horário de Pico no Instagram</strong>
                    <p>Seus seguidores estão ativos agora! Poste um Story nas próximas 2 horas.</p>
                </div>
                <button className={styles.actionBtn}>Postar</button>
            </div>

            <div className={styles.card}>
                <div className={styles.icon} style={{ background: 'var(--dynamic-accent)' }}>
                    <FiTrendingUp />
                </div>
                <div className={styles.content}>
                    <strong>"Vibe de Verão" em Alta</strong>
                    <p>Sua playlist "Vibe de Verão" cresceu 15% hoje. Adicione novas faixas para manter o ritmo.</p>
                </div>
                <button className={styles.actionBtn}>Editar</button>
            </div>

            <div className={styles.card}>
                <div className={styles.icon} style={{ background: '#FF0000' }}>
                    <FiVideo />
                </div>
                <div className={styles.content}>
                    <strong>Ideia de Conteúdo</strong>
                    <p>Vídeos curtos de "Bastidores" estão convertendo 3x mais seguidores esta semana.</p>
                </div>
            </div>
        </div>
    );
};

export default SmartInsights;
