import React, { useState, useRef, useEffect } from "react";
import { Link } from 'react-router-dom';
import { FiBell, FiMessageSquare, FiDollarSign, FiInfo, FiCheck } from "react-icons/fi";
import { useNotifications } from "@/contexts/NotificationContext";
import styles from "./NotificationBell.module.css";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case "sale": return <FiDollarSign className={styles.iconSale} />;
            case "comment": return <FiMessageSquare className={styles.iconComment} />;
            case "boost": return <FiInfo className={styles.iconBoost} />;
            default: return <FiInfo className={styles.iconInfo} />;
        }
    };

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={styles.bellBtn}
                onClick={() => setIsOpen(!isOpen)}
                title="Notificações"
            >
                <FiBell />
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <h3>Notificações</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className={styles.markAllBtn}>
                                Ler todas
                            </button>
                        )}
                    </div>

                    <div className={styles.list}>
                        {notifications.length === 0 ? (
                            <div className={styles.empty}>
                                <p>Nenhuma notificação por aqui.</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`${styles.item} ${!notif.isRead ? styles.unread : ""}`}
                                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                                >
                                    <div className={styles.iconWrapper}>
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className={styles.content}>
                                        <div className={styles.itemHeader}>
                                            <span className={styles.title}>{notif.title}</span>
                                            <span className={styles.time}>
                                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR })}
                                            </span>
                                        </div>
                                        <p className={styles.message}>{notif.message}</p>
                                    </div>
                                    {!notif.isRead && <div className={styles.unreadDot} />}
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className={styles.footer}>
                            <Link to="/notifications" className={styles.viewAll} onClick={() => setIsOpen(false)}>
                                Ver tudo
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
