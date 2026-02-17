import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getStorageUrl } from '../../utils/urlUtils';
import styles from './Stories.module.css';

const Stories = () => {
    const [artists, setArtists] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStories = async () => {
            try {
                // Reusing featured artists endpoint for now
                const res = await api.get('/boost/featured-artists');
                setArtists(res.data);
            } catch (error) {
                console.error("Error fetching stories:", error);
            }
        };
        fetchStories();
    }, []);

    if (!artists || artists.length === 0) return null;

    return (
        <div className={styles.container}>
            <div className={styles.scrollArea}>
                {artists.map((artist, index) => (
                    <div
                        key={`${artist.id}-${index}`}
                        className={styles.storyItem}
                        onClick={() => navigate(`/artist/${artist.id}`)}
                    >
                        <div className={`${styles.avatarRing} ${index === 0 ? styles.activeRing : ''}`}>
                            <img
                                src={artist.avatar ? getStorageUrl(artist.avatar) : '/default-avatar.png'}
                                alt={artist.artisticName}
                                className={styles.avatar}
                            />
                        </div>
                        <span className={styles.name}>
                            {(artist.artisticName || 'Artista').split(' ')[0]} {/* First name only */}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Stories;
