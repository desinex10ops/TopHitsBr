import React from 'react';
import { FiUserCheck, FiTrendingUp } from 'react-icons/fi';
import styles from './EarnMoney.module.css';

const CreatorCard = ({ creator, rank }) => {
    return (
        <div className={styles.creatorCard}>
            <div className={styles.rankBadge}>#{rank}</div>
            <img src={creator.avatar} alt={creator.name} className={styles.creatorAvatar} />

            <div className={styles.creatorInfo}>
                <h4 className={styles.creatorName}>{creator.name}</h4>
                <div className={styles.creatorStats}>
                    <FiTrendingUp className={styles.statsIcon} />
                    <span>{creator.sales} vendas</span>
                </div>
            </div>

            <button className={styles.followBtn}>Ver Perfil</button>
        </div>
    );
};

const TopCreatorsList = () => {
    const creators = [
        { id: 1, name: "DJ Shark", sales: "15k", avatar: "https://i.pravatar.cc/150?u=1" },
        { id: 2, name: "MC Hariel", sales: "12k", avatar: "https://i.pravatar.cc/150?u=2" },
        { id: 3, name: "Gusttavo", sales: "10k", avatar: "https://i.pravatar.cc/150?u=3" },
        { id: 4, name: "Alok", sales: "9.5k", avatar: "https://i.pravatar.cc/150?u=4" }
    ];

    return (
        <div className={styles.creatorsContainer}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>🏆 Top Criadores</h2>
            </div>

            <div className={styles.creatorsGrid}>
                {creators.map((creator, index) => (
                    <CreatorCard key={creator.id} creator={creator} rank={index + 1} />
                ))}
            </div>
        </div>
    );
};

export default TopCreatorsList;
