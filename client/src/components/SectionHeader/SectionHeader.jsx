import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import styles from './SectionHeader.module.css';

const SectionHeader = ({ title, subtitle, to }) => {
    return (
        <div className={styles.header}>
            <div className={styles.titles}>
                <h2 className={styles.title}>{title}</h2>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>

            {to && (
                <Link to={to} className={styles.seeAll}>
                    <span>Ver tudo</span>
                    <FiChevronRight />
                </Link>
            )}
        </div>
    );
};

export default SectionHeader;
