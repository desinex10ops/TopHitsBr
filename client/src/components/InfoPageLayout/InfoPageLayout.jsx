import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import styles from './InfoPageLayout.module.css';

const InfoPageLayout = ({ title, children, breadcrumb }) => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.breadcrumbs}>
                    <Link to="/" className={styles.breadcrumbLink}><FiHome /> Início</Link>
                    <FiChevronRight className={styles.separator} />
                    {breadcrumb && (
                        <>
                            <span className={styles.breadcrumbCurrent}>{breadcrumb}</span>
                        </>
                    )}
                </div>
                <h1 className={styles.title}>{title}</h1>
            </div>

            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
};

export default InfoPageLayout;
