import * as React from 'react';
const { useEffect, useState } = React;
import { Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './Genres.module.css';

const Genres = () => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/music/genres')
            .then(res => {
                if (Array.isArray(res.data)) {
                    setGenres(res.data);
                } else {
                    console.error("Invalid genres data:", res.data);
                    setGenres([]);
                }
            })
            .catch(err => {
                console.error("Error fetching genres:", err);
                setGenres([]);
            })
            .finally(() => setLoading(false));
    }, []);

    // Cores aleatórias para os cards de gênero
    const colors = ['#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#009688', '#FF5722', '#795548'];

    return (
        <div className="container">
            <h2 className={styles.title}>Navegar por Gêneros</h2>
            {loading ? <p>Carregando...</p> : (
                <div className={styles.grid}>
                    {genres.map((genre, index) => (
                        <Link
                            to={`/genres/${encodeURIComponent(genre)}`}
                            key={genre}
                            className={styles.card}
                            style={{ backgroundColor: colors[index % colors.length] }}
                        >
                            <h3>{genre}</h3>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Genres;
