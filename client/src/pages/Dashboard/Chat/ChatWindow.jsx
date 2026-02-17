import React, { useState } from 'react';
import styles from './ChatPage.module.css';
import { FiSend, FiUser, FiMoreVertical, FiMessageSquare } from 'react-icons/fi';

const ChatWindow = ({
    conversation,
    messages,
    currentUser,
    onSendMessage,
    messagesEndRef
}) => {
    const [newMessage, setNewMessage] = useState('');

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        onSendMessage(newMessage);
        setNewMessage('');
    };

    const getOtherUser = (c) => {
        if (!c || !c.otherUser) return null;
        return c.otherUser;
    };

    if (!conversation) {
        return (
            <div className={styles.noConversation}>
                <FiMessageSquare size={48} />
                <h3>Selecione uma conversa</h3>
            </div>
        );
    }

    const otherUser = getOtherUser(conversation);

    return (
        <div className={styles.chatWindow}>
            <div className={styles.chatHeader}>
                <div className={styles.headerUser}>
                    <div className={styles.avatar}>
                        {otherUser?.avatar ?
                            <img src={otherUser.avatar} alt="avatar" /> :
                            <FiUser />
                        }
                    </div>
                    <span>{otherUser?.name || 'Usuário'}</span>
                </div>
                <button className={styles.optionsBtn}><FiMoreVertical /></button>
            </div>

            <div className={styles.messagesArea}>
                {messages.map((msg, index) => (
                    <div
                        key={msg.id || index}
                        className={`${styles.messageBubble} ${msg.senderId === currentUser.id ? styles.sent : styles.received}`}
                    >
                        <p>{msg.content}</p>
                        <span className={styles.timestamp}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form className={styles.inputArea} onSubmit={handleSend}>
                <input
                    type="text"
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit"><FiSend /></button>
            </form>
        </div>
    );
};

export default ChatWindow;
