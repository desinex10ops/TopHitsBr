import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import Player from '../Player/Player';
import Footer from '../Footer/Footer';
import MobileTabBar from '../MobileTabBar/MobileTabBar';
import styles from './MainLayout.module.css';

const MainLayout = ({ children }) => {
    const location = useLocation();

    // Logic to hide layout elements on Auth/Dashboard routes
    const isAuthRoute = ['/login', '/register', '/register-producer'].includes(location.pathname);
    const isDashboardRoute = location.pathname.startsWith('/dashboard');
    const showMainLayout = !isAuthRoute && !isDashboardRoute;

    if (!showMainLayout) {
        return <div className={styles.fullContent}>{children}</div>;
    }

    return (
        <div className={styles.appContainer}>
            {/* Desktop Sidebar - Hidden on Mobile via CSS */}
            <div className={styles.desktopOnly}>
                <Sidebar />
            </div>

            <div className={styles.mainContent}>
                {/* Header - Adaptive */}
                <Header />

                {/* Page Content */}
                <div className={styles.pageContent}>
                    {children}
                </div>

                <Footer />

                {/* Spacer for Bottom Nav on Mobile */}
                <div className={styles.mobileSpacer} />
            </div>

            {/* Configured Player (Desktop: Footer / Mobile: Floating) */}
            <Player />

            {/* Mobile Tab Bar - Replaces MobileMenu */}
            <div className={styles.mobileOnly}>
                <MobileTabBar />
            </div>
        </div>
    );
};

export default MainLayout;
