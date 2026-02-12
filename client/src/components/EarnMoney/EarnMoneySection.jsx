import * as React from 'react';
import MarketplaceBanner from './MarketplaceBanner';
import FeaturedPacksCarousel from './FeaturedPacksCarousel';
import TopCreatorsList from './TopCreatorsList';
import styles from './EarnMoney.module.css';

const EarnMoneySection = () => {
    return (
        <section className={styles.sectionContainer}>
            <MarketplaceBanner />
            <FeaturedPacksCarousel />
            <TopCreatorsList />
        </section>
    );
};

export default EarnMoneySection;
