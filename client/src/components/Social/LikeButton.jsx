import React, { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '@/contexts/ToastContext';
import styles from './LikeButton.module.css';

const LikeButton = ({ trackId, initialLiked = false, className, size = 20 }) => {
    const [liked, setLiked] = useState(initialLiked);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (initialLiked !== undefined) {
            setLiked(initialLiked);
        } else if (trackId) {
            // Fetch status
            api.get(`/social/like/${trackId}/status`)
                .then(res => setLiked(res.data.liked))
                .catch(err => console.error("Erro ao verificar like:", err));
        }
    }, [initialLiked, trackId]);

    const handleToggleLike = async (e) => {
        e.stopPropagation(); // Prevent playing track when clicking heart
        if (loading) return;

        // Optimistic update
        const previousState = liked;
        setLiked(!liked);
        setLoading(true);

        try {
            if (previousState) {
                await api.delete(`/social/like/${trackId}`);
            } else {
                await api.post(`/social/like/${trackId}`);
            }
        } catch (error) {
            console.error("Erro ao curtir:", error);
            setLiked(previousState); // Revert
            addToast('Erro ao atualizar curtida.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`${styles.likeBtn} ${liked ? styles.active : ''} ${className || ''}`}
            onClick={handleToggleLike}
            title={liked ? "Descurtir" : "Curtir"}
            style={{ fontSize: size }}
        >
            <FiHeart fill={liked ? "currentColor" : "none"} />
        </button>
    );
};

export default LikeButton;
