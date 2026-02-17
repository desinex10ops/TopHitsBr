import React, { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import styles from './Notifications.module.css';
import { FiDollarSign, FiMessageSquare, FiInfo, FiClock, FiCheck } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Notifications = () => {
    const { notifications, markAsRead, markAllAsRead } = useNotifications();

    const getIcon = (type) => {
        switch (type) {
            case "sale": return <FiDollarSign className={styles.iconSale} />;
            case "comment": return <FiMessageSquare className={styles.iconComment} />;
            case "boost": return <FiInfo className={styles.iconBoost} />;
            default: return <FiInfo className={styles.iconInfo} />;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Minhas Notificações</h1>
                {notifications.some(n => !n.isRead) && (
                    <button onClick={markAllAsRead} className={styles.markAllBtn}>
                        <FiCheck style={{ marginRight: 5 }} />
                        Marcar todas como lidas
                    </button>
                )}
            </div>

            <div className={styles.list}>
                {notifications.length === 0 ? (
                    <div className={styles.empty}>
                        <p>Você não tem notificações no momento.</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div
                            key={notif.id}
                            className={`${styles.item} ${!notif.isRead ? styles.unread : ''}`}
                            onClick={() => !notif.isRead && markAsRead(notif.id)}
                        >
                            <div className={styles.iconWrapper}>
                                {getIcon(notif.type)}
                            </div>
                            <div className={styles.content}>
                                <div className={styles.itemHeader}>
                                    <span className={styles.notificationTitle}>{notif.title}</span>
                                    <span className={styles.time}>
                                        <FiClock style={{ marginRight: 4, verticalAlign: 'middle' }} />
                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR })}
                                    </span>
                                </div>
                                <p className={styles.message}>{notif.message}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
