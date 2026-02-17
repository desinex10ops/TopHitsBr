import React, { useState } from 'react';
import styles from './ImageWithFade.module.css';

const ImageWithFade = ({ src, alt, className }) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <img
            src={src}
            alt={alt}
            className={`${className} ${styles.img} ${loaded ? styles.loaded : ''}`}
            onLoad={() => setLoaded(true)}
            crossOrigin="anonymous"
        />
    );
};

export default ImageWithFade;
