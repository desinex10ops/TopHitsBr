import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [socket, setSocket] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchNotifications();

            const newSocket = io(API_URL, {
                withCredentials: true,
                transports: ['websocket']
            });

            newSocket.on('connect', () => {
                console.log('Connected to notification socket');
                newSocket.emit('register', user.id);
            });

            newSocket.on('notification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                if (!notification.isRead) {
                    setUnreadCount(prev => prev + 1);
                }

                // Show real-time toast
                toast.info(`${notification.title}: ${notification.message}`, {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                    icon: notification.type === 'sale' ? '💰' : (notification.type === 'comment' ? '💬' : '🔔')
                });
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        } else {
            setNotifications([]);
            setUnreadCount(0);
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, socket }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
export const useNotification = useNotifications; // Alias para compatibilidade
