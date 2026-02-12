import React, { useState, useEffect } from 'react';
import styles from './StickyMenu.module.css';
import { FiDisc, FiSave, FiClock, FiGrid } from 'react-icons/fi';

const StickyMenu = () => {
    const [isSticky, setIsSticky] = useState(false);

    const handleScroll = () => {
        const offset = window.scrollY;
        if (offset > 200) {
            setIsSticky(true);
        } else {
            setIsSticky(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 100; // Adjust for header height
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className={`${styles.menuContainer} ${isSticky ? styles.sticky : ''}`}>
            <button onClick={() => scrollToSection('pendrive-section')} className={styles.menuItem}>
                <FiSave /> Pen Drive
            </button>
            <button onClick={() => scrollToSection('top-cds-section')} className={styles.menuItem}>
                <FiDisc /> Top CDs
            </button>
            <button onClick={() => scrollToSection('recent-releases-section')} className={styles.menuItem}>
                <FiClock /> Mais Recentes
            </button>
            <button onClick={() => scrollToSection('boosted-section')} className={styles.menuItem}>
                <FiGrid /> Em Alta
            </button>
        </div>
    );
};

export default StickyMenu;
