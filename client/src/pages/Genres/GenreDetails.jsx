import { getStorageUrl } from '../../utils/urlUtils';
import * as React from 'react';
const { useEffect, useState } = React;
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import styles from '../Home/Home.module.css'; // Reutilizando estilos da Home
import { usePlayer } from '../../contexts/PlayerContext';
import SkeletonCard from '../../components/SkeletonCard/SkeletonCard';
import ImageWithFade from '../../components/ImageWithFade/ImageWithFade';

const GenreDetails = () => {
    const { genre } = useParams();
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { playTrack, addToPendrive } = usePlayer();

    useEffect(() => {
        setLoading(true);
        // Decodificar gênero da URL
        const decodedGenre = decodeURIComponent(genre);
        api.get(`/music/genres/${encodeURIComponent(decodedGenre)}`)
            .then(res => setTracks(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [genre]);

    return (
        <div className="container">
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Gênero: {genre}</h2>

                {loading ? (
                    <div className={styles.grid}>
                        {[...Array(10)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : tracks.length === 0 ? (
                    <p>Nenhuma música encontrada neste gênero.</p>
                ) : (
                    <div className={styles.grid}>
                        {tracks.map(track => (
                            <div key={track.id} className={styles.card}>
                                <div className={styles.coverWrapper}>
                                    {track.coverpath ? (
                                        <ImageWithFade src={getStorageUrl(track.coverpath)} alt={track.title} className={styles.cover} />
                                    ) : (
                                        <div className={styles.coverPlaceholder}>🎵</div>
                                    )}
                                    <div className={styles.overlay}>
                                        <button className={styles.playBtn} onClick={() => playTrack(track)} title="Ouvir">▶</button>
                                        <button className={styles.addBtn} onClick={() => addToPendrive(track)} title="Adicionar ao Pen Drive">➕</button>
                                    </div>
                                </div>
                                <div className={styles.info}>
                                    <h3 className={styles.trackTitle}>{track.title}</h3>
                                    <p className={styles.artistName}>{track.artist}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default GenreDetails;
