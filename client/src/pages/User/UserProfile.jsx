import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './UserProfile.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { getStorageUrl } from '../../utils/urlUtils';

import { FiMessageSquare } from 'react-icons/fi';
import ChatModal from '../Dashboard/Chat/ChatModal';

const UserProfile = () => {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/users/${id}`);
            setProfile(res.data.user);
            setIsFollowing(res.data.isFollowing);
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
            toast.error("Erro ao carregar perfil.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = () => {
        if (!currentUser) {
            toast.error("Você precisa estar logado para enviar mensagens.");
            return;
        }
        setIsChatOpen(true);
    };

    const handleFollow = async () => {
        if (!currentUser) return toast.info("Faça login para seguir.");

        try {
            if (isFollowing) {
                await api.delete(`/social/follow/${id}`);
                setIsFollowing(false);
                setProfile(prev => ({
                    ...prev,
                    stats: { ...prev.stats, followers: (prev.stats?.followers || 0) - 1 }
                }));
            } else {
                await api.post(`/social/follow/${id}`);
                setIsFollowing(true);
                setProfile(prev => ({
                    ...prev,
                    stats: { ...prev.stats, followers: (prev.stats?.followers || 0) + 1 }
                }));
                toast.success(`Você agora segue ${profile.name || 'este usuário'}!`);
            }
        } catch (error) {
            console.error("Erro ao seguir/deixar de seguir:", error);
            toast.error("Ação falhou.");
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!profile) return <div className={styles.container}>Usuário não encontrado.</div>;

    const avatarUrl = profile.avatar ? getStorageUrl(profile.avatar) : '/default-avatar.png';

    return (
        <div className={styles.container}>
            <div
                className={styles.coverHeader}
                style={{ backgroundImage: `url(${getStorageUrl(profile.cover || 'default-cover.jpg')})` }}
            ></div>

            <div className={styles.profileInfo}>
                <img
                    src={avatarUrl}
                    alt={profile.name}
                    className={styles.avatar}
                />

                <h1 className={styles.username}>{profile.artisticName || profile.name}</h1>
                <span className={styles.userType}>{profile.type}</span>

                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{profile.stats?.followers || 0}</span>
                        <span className={styles.statLabel}>Seguidores</span>
                    </div>
                    {/* Add more stats if available */}
                </div>

                <div className={styles.actions}>
                    {currentUser && currentUser.id !== profile.id && (
                        <>
                            <button
                                className={`${styles.followBtn} ${isFollowing ? styles.following : styles.notFollowing}`}
                                onClick={handleFollow}
                            >
                                {isFollowing ? 'Deixar de seguir' : 'Seguir'}
                            </button>
                            <button className={styles.messageBtn} onClick={handleSendMessage} title="Enviar Mensagem">
                                <FiMessageSquare />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Public Playlists or Other Content could go here */}
            {/* 
            <div className={styles.contentSection}>
                <h3 className={styles.sectionTitle}>Playlists Públicas</h3>
                <div className={styles.grid}>
                    ...
                </div>
            </div> 
            */}

            {/* Chat Modal */}
            {currentUser && profile && (
                <ChatModal
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    recipientId={profile.id}
                    recipientName={profile.artisticName || profile.name}
                    recipientAvatar={avatarUrl}
                />
            )}
        </div>
    );
};

export default UserProfile;
