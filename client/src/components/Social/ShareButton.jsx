import React from 'react';
import { FiShare2, FiCheck } from 'react-icons/fi';
import { useToast } from '@/contexts/ToastContext';
import styles from './ShareButton.module.css';

const ShareButton = ({ title, text, url, className }) => {
    const { addToast } = useToast();
    const [copied, setCopied] = React.useState(false);

    const handleShare = async () => {
        const shareData = {
            title: title || 'TopHitsBr',
            text: text || 'Confira essa música incrível!',
            url: url || window.location.href
        };

        if (navigator.share && /mobile|android|iphone/i.test(navigator.userAgent)) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            // Fallback to clipboard
            try {
                await navigator.clipboard.writeText(shareData.url);
                setCopied(true);
                addToast('Link copiado para a área de transferência!', 'success');
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                addToast('Erro ao copiar link.', 'error');
            }
        }
    };

    return (
        <button
            className={`${styles.shareBtn} ${className || ''}`}
            onClick={handleShare}
            title="Compartilhar"
        >
            {copied ? <FiCheck /> : <FiShare2 />}
        </button>
    );
};

export default ShareButton;
