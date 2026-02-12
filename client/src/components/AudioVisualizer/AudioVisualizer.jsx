import * as React from 'react';
const { useRef, useEffect } = React;
import { usePlayer } from '../../contexts/PlayerContext';

const AudioVisualizer = ({ height = 50, width = 300, color = '#1db954' }) => {
    const canvasRef = useRef(null);
    const { analyserRef, isPlaying } = usePlayer();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;

        const renderFrame = () => {
            if (!analyserRef.current) return;

            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, width, height);

            const barWidth = (width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * height;

                ctx.fillStyle = color;
                // Efeito de gradiente opcional
                // ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`; 

                // Desenhar barra (invertida para crescer de baixo para cima)
                ctx.fillRect(x, height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }

            if (isPlaying) {
                animationId = requestAnimationFrame(renderFrame);
            }
        };

        if (isPlaying) {
            renderFrame();
        } else {
            ctx.clearRect(0, 0, width, height); // Limpar se pausado
        }

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [analyserRef, isPlaying, height, width, color]);

    return <canvas ref={canvasRef} width={width} height={height} />;
};

export default AudioVisualizer;
