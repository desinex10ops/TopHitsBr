import React from 'react';
import styles from './TabStyles.module.css';
import { FiUser, FiInfo, FiMapPin } from 'react-icons/fi';

const TabProfile = ({ formData, onChange, onSave, saving, userType }) => {
    const bioMaxLength = 500;

    return (
        <div className={styles.tabContainer}>
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                    <FiUser /> Informações Básicas
                </h3>

                <div className={styles.grid}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Nome Completo</label>
                        <input
                            name="name"
                            className={styles.input}
                            value={formData.name}
                            onChange={onChange}
                            placeholder="Seu nome real"
                        />
                    </div>

                    {userType !== 'listener' && (
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Nome Artístico</label>
                            <input
                                name="artisticName"
                                className={styles.input}
                                value={formData.artisticName}
                                onChange={onChange}
                                placeholder="Como os fãs te conhecem"
                            />
                        </div>
                    )}
                </div>

                <div className={styles.grid} style={{ marginTop: 20 }}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Cidade</label>
                        <input
                            name="city"
                            className={styles.input}
                            value={formData.city}
                            onChange={onChange}
                            placeholder="Ex: São Paulo"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Estado (UF)</label>
                        <input
                            name="state"
                            className={styles.input}
                            value={formData.state}
                            onChange={onChange}
                            placeholder="Ex: SP"
                            maxLength={2}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                    <FiInfo /> Biografia
                </h3>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Conte sua história</label>
                    <textarea
                        name="bio"
                        className={styles.textarea}
                        value={formData.bio}
                        onChange={onChange}
                        placeholder="Fale um pouco sobre sua carreira, influências e o que te move..."
                        maxLength={bioMaxLength}
                    />
                    <div className={styles.charCount}>
                        {formData.bio?.length || 0} / {bioMaxLength}
                    </div>
                </div>
            </div>

            <button
                className={styles.saveBtn}
                onClick={onSave}
                disabled={saving}
            >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </div>
    );
};

export default TabProfile;
