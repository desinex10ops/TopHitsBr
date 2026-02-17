import React from 'react';
import styles from './Marketing.module.css';
import GrowthCards from './components/GrowthCards';
import TrafficChart from './components/TrafficChart';
import AudienceInsights from './components/AudienceInsights';
import SmartInsights from './components/SmartInsights';

const MarketingOverview = () => {
    return (
        <div className={styles.overviewContainer}>
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Resumo de Crescimento</h2>
                <GrowthCards />
            </section>

            <div className={styles.gridRow}>
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Origem do Público</h2>
                    <TrafficChart />
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Insights Inteligentes</h2>
                    <SmartInsights />
                </section>
            </div>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Perfil da Audiência</h2>
                <AudienceInsights />
            </section>
        </div>
    );
};

export default MarketingOverview;
