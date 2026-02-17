import React, { useState, useEffect } from 'react';
import styles from './NewChatModal.module.css';
import { FiX, FiSearch, FiUser } from 'react-icons/fi';
import api from '@/services/api';
import { getStorageUrl } from '@/utils/urlUtils';

const NewChatModal = ({ isOpen, onClose, onStartChat }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim().length >= 2) {
                handleSearch();
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSearch = async () => {
        setSearching(true);
        try {
            const response = await api.get(`/users/user-search?q=${query}`);
            setResults(response.data);
        } catch (error) {
            console.error("Erro na busca", error);
        } finally {
            setSearching(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <header className={styles.header}>
                    <h2>Nova Conversa</h2>
                    <button onClick={onClose}><FiX /></button>
                </header>

                <div className={styles.searchBox}>
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou nome artístico..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className={styles.resultsList}>
                    {searching && <p className={styles.status}>Buscando...</p>}

                    {!searching && results.length === 0 && query.length >= 2 && (
                        <p className={styles.status}>Nenhum usuário encontrado.</p>
                    )}

                    {results.map(user => (
                        <div key={user.id} className={styles.userItem} onClick={() => onStartChat(user)}>
                            <div className={styles.avatar}>
                                {user.avatar ? (
                                    <img src={getStorageUrl(user.avatar)} alt={user.name} />
                                ) : (
                                    <FiUser />
                                )}
                            </div>
                            <div className={styles.userInfo}>
                                <span className={styles.name}>{user.artisticName || user.name}</span>
                                <span className={styles.type}>{user.type === 'admin' ? 'Admin' : user.type === 'artist' ? 'Artista' : 'Usuário'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewChatModal;
