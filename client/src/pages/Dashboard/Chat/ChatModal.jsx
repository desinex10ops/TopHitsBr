import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import styles from './ChatPage.module.css'; // Reusing styles
import ChatWindow from './ChatWindow';
import { FiX, FiMinimize2 } from 'react-icons/fi';

const ChatModal = ({ isOpen, onClose, recipientId, recipientName, recipientAvatar }) => {
    const { user } = useAuth();
    const { socket } = useNotification();
    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Initialize conversation when modal opens
    useEffect(() => {
        if (isOpen && recipientId) {
            initializeChat();
        }
    }, [isOpen, recipientId]);

    const initializeChat = async () => {
        try {
            // First try to find existing conversation or start new one
            // Ideally we have an endpoint to get conversation by recipient
            // For now, let's just 'start' one, which usually returns existing if present
            const res = await axios.post(`${API_URL}/api/chat/start`, { recipientId }, { withCredentials: true });

            // The API returns the conversation object
            // We need to shape it like the one expected by ChatWindow
            // The Start endpoint might return a simplified object, so we might need to fetch messages separately

            const conv = res.data;
            // Ensure otherUser is set correctly so ChatWindow can display it
            if (!conv.otherUser) {
                conv.otherUser = {
                    id: recipientId,
                    name: recipientName,
                    avatar: recipientAvatar
                };
            }

            setConversation(conv);
            fetchMessages(conv.id);

        } catch (error) {
            console.error("Erro ao iniciar chat no modal:", error);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const res = await axios.get(`${API_URL}/api/chat/messages/${conversationId}`, { withCredentials: true });
            setMessages(res.data);
            scrollToBottom();
        } catch (error) {
            console.error("Erro ao buscar mensagens do modal:", error);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    // Socket listener for real-time updates in modal
    useEffect(() => {
        if (!socket || !conversation) return;

        const handleNotification = (payload) => {
            if (payload.type === 'chat_message' || payload.type === 'new_message') {
                const { conversationId, message } = payload.data || {};
                if (conversationId === conversation.id) {
                    setMessages(prev => [...prev, message]);
                    scrollToBottom();
                }
            }
        };

        socket.on('notification', handleNotification);

        return () => {
            socket.off('notification', handleNotification);
        };
    }, [socket, conversation]);

    const handleSendMessage = async (content) => {
        if (!content.trim() || !conversation) return;

        try {
            const res = await axios.post(`${API_URL}/api/chat/send`, {
                conversationId: conversation.id,
                content: content
            }, { withCredentials: true });

            setMessages([...messages, res.data]);
            scrollToBottom();
        } catch (error) {
            console.error("Erro ao enviar mensagem no modal:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.chatModalOverlay}>
            <div className={styles.chatModalContainer}>
                <div className={styles.chatModalHeader}>
                    <span>{recipientName}</span>
                    <div className={styles.modalControls}>
                        <button onClick={onClose}><FiX /></button>
                    </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    {/* Reuse ChatWindow but maybe we need to adjust styles for modal context */}
                    {/* Passing a mapped conversation object that ChatWindow understands */}
                    <ChatWindow
                        conversation={conversation}
                        messages={messages}
                        currentUser={user}
                        onSendMessage={handleSendMessage}
                        messagesEndRef={messagesEndRef}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
