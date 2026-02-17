import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotification } from '../../../contexts/NotificationContext';
import styles from './ChatPage.module.css';
import { FiUser, FiPlus } from 'react-icons/fi'; // [UPDATED]
import ChatWindow from './ChatWindow';
import NewChatModal from './NewChatModal'; // [NEW]

const ChatPage = () => {
    const { user } = useAuth();
    const { socket } = useNotification();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // [NEW]
    const messagesEndRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Fetch Conversations
    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/chat/conversations`, { withCredentials: true });
            setConversations(res.data);
        } catch (error) {
            console.error("Erro ao buscar conversas:", error);
        }
    };

    // ... (rest of useEffects remain same)

    const handleStartChat = async (targetUser) => {
        setIsModalOpen(false);
        try {
            // Check if conversation already exists locally
            const existing = conversations.find(c => {
                const other = getOtherUser(c);
                return other && other.id === targetUser.id;
            });

            if (existing) {
                setSelectedConversation(existing);
                return;
            }

            // Start new conversation via API
            const res = await axios.post(`${API_URL}/api/chat/start`, { recipientId: targetUser.id }, { withCredentials: true });

            // If it returns an ID, fetch details or optimistic update
            // Ideally backend returns full conversation object, but if just ID:
            if (res.data.id) {
                await fetchConversations(); // Reload list
                // We need to set it as selected. 
                // Since fetchConversations is async, we might not have it in state immediately.
                // A quick hack is to fetch again and find it, or simply trust the reload.
                // Better: Backend `start` should return full object. 
                // Let's assume user clicks it in list after reload for now to be safe, or we try to find it.
            }
        } catch (error) {
            console.error("Erro ao iniciar chat:", error);
        }
    };

    // ... (rest of functions)

    const getOtherUser = (c) => {
        return c?.otherUser;
    };

    const handleSendMessageSubmit = async (content) => {
        if (!content.trim() || !selectedConversation) return;

        // Optimistic update
        const tempId = Date.now();
        const newMessage = {
            id: tempId,
            conversationId: selectedConversation.id,
            senderId: user.id,
            content,
            createdAt: new Date(),
            read: false,
            pending: true
        };

        setMessages(prev => [...prev, newMessage]);

        try {
            const res = await axios.post(`${API_URL}/api/chat/send`, {
                conversationId: selectedConversation.id,
                content
            }, { withCredentials: true });

            // Replace temp message with real one
            setMessages(prev => prev.map(m => m.id === tempId ? res.data : m));

            // Update conversation list last message
            setConversations(prev => prev.map(c => {
                if (c.id === selectedConversation.id) {
                    return {
                        ...c,
                        lastMessage: {
                            content,
                            createdAt: new Date(),
                            senderId: user.id
                        },
                        updatedAt: new Date()
                    };
                }
                return c;
            }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));

        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
            // Revert on error
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };

    return (
        <div className={styles.chatContainer}>
            {/* Sidebar List */}
            <div className={styles.chatSidebar}>
                <div className={styles.sidebarHeader}>
                    <h2>Mensagens</h2>
                    <button className={styles.newChatBtn} onClick={() => setIsModalOpen(true)} title="Nova Conversa">
                        <FiPlus />
                    </button>
                </div>
                <div className={styles.conversationList}>
                    {conversations.map(c => (
                        <div
                            key={c.id}
                            className={`${styles.conversationItem} ${selectedConversation?.id === c.id ? styles.active : ''}`}
                            onClick={() => setSelectedConversation(c)}
                        >
                            <div className={styles.avatar}>
                                {getOtherUser(c)?.avatar ?
                                    <img src={getOtherUser(c).avatar} alt="avatar" /> :
                                    <FiUser />
                                }
                            </div>
                            <div className={styles.conversationInfo}>
                                <span className={styles.userName}>{getOtherUser(c)?.name || 'Usuário Desconhecido'}</span>
                                <span className={styles.lastMessage}>
                                    {c.lastMessage ? (
                                        <>
                                            {c.lastMessage.senderId === user.id ? 'Você: ' : ''}
                                            {c.lastMessage.content}
                                        </>
                                    ) : 'Inicie uma conversa'}
                                </span>
                            </div>
                        </div>
                    ))}
                    {conversations.length === 0 && (
                        <div className={styles.emptyState}>
                            <p>Nenhuma conversa.</p>
                            <button onClick={() => setIsModalOpen(true)}>Iniciar Chat</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <ChatWindow
                conversation={selectedConversation}
                messages={messages}
                currentUser={user}
                onSendMessage={handleSendMessageSubmit}
                messagesEndRef={messagesEndRef}
            />

            <NewChatModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onStartChat={handleStartChat}
            />
        </div>
    );
};

export default ChatPage;
