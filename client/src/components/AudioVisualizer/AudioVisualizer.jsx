import React, { useRef, useEffect } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

const AudioVisualizer = ({ height = 50, width = 300, color = 'var(--dynamic-accent)' }) => {
    const canvasRef = useRef(null);
    const { analyserRef, isPlaying } = usePlayer();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;

        if (analyserRef.current) {
            analyserRef.current.smoothingTimeConstant = 0.8; // Smooth transitions
        }

        const renderFrame = () => {
            if (!analyserRef.current) return;

            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, width, height);

            // Calculate responsive bar width
            const barWidth = (width / bufferLength) * 2;
            let x = 0;

            // Resolve CSS variable to actual color if it's a var()
            let resolvedColor = color;
            if (color.startsWith('var(')) {
                const varName = color.match(/var\(([^)]+)\)/)[1];
                resolvedColor = getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || '#ff0055';
            }

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * height;

                // Create a sleek gradient for each bar
                const gradient = ctx.createLinearGradient(0, height - barHeight, 0, height);
                // Canvas API doesn't understand var() natively inside addColorStop without parsing
                gradient.addColorStop(0, resolvedColor);
                gradient.addColorStop(1, `${resolvedColor}40`); // Fades out at bottom

                ctx.fillStyle = gradient;

                // Rounded bar effect (using small rects or arc if needed, but rect is fine)
                ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

                x += barWidth;
            }

            if (isPlaying) {
                animationId = requestAnimationFrame(renderFrame);
            }
        };

        if (isPlaying) {
            renderFrame();
        } else {
            ctx.clearRect(0, 0, width, height);
        }

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [analyserRef, isPlaying, height, width, color]);

    return <canvas ref={canvasRef} width={width} height={height} style={{ width: '100%', height: '100%' }} />;
};

export default AudioVisualizer;
