import React from 'react';
import styles from './AudienceInsights.module.css';
import { FiMapPin, FiClock } from 'react-icons/fi';

const AudienceInsights = () => {
    return (
        <div className={styles.container}>
            <div className={styles.column}>
                <h3>Faixa Etária</h3>
                <div className={styles.barGroup}>
                    <div className={styles.barItem}>
                        <div className={styles.barLabel}>
                            <span>18-24</span>
                            <span>45%</span>
                        </div>
                        <div className={styles.progressBg}>
                            <div className={styles.progressBar} style={{ width: '45%' }}></div>
                        </div>
                    </div>
                    <div className={styles.barItem}>
                        <div className={styles.barLabel}>
                            <span>25-34</span>
                            <span>30%</span>
                        </div>
                        <div className={styles.progressBg}>
                            <div className={styles.progressBar} style={{ width: '30%' }}></div>
                        </div>
                    </div>
                    <div className={styles.barItem}>
                        <div className={styles.barLabel}>
                            <span>35-44</span>
                            <span>15%</span>
                        </div>
                        <div className={styles.progressBg}>
                            <div className={styles.progressBar} style={{ width: '15%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.column}>
                <h3>Top Logalizações</h3>
                <ul className={styles.list}>
                    <li className={styles.listItem}>
                        <div className={styles.listIcon}><FiMapPin /></div>
                        <div className={styles.listInfo}>
                            <strong>São Paulo, BR</strong>
                            <span>3,420 ouvintes</span>
                        </div>
                        <div className={styles.listTrend}>+12%</div>
                    </li>
                    <li className={styles.listItem}>
                        <div className={styles.listIcon}><FiMapPin /></div>
                        <div className={styles.listInfo}>
                            <strong>Rio de Janeiro, BR</strong>
                            <span>2,100 ouvintes</span>
                        </div>
                        <div className={styles.listTrend}>+5%</div>
                    </li>
                    <li className={styles.listItem}>
                        <div className={styles.listIcon}><FiMapPin /></div>
                        <div className={styles.listInfo}>
                            <strong>Lisboa, PT</strong>
                            <span>850 ouvintes</span>
                        </div>
                        <div className={styles.listTrend}>+22%</div>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default AudienceInsights;
