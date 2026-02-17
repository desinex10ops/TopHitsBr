import React, { useRef, useEffect, useState } from 'react';

const ChromaPet = ({ videoUrl, width = 50, height = 50, tolerance = 100, smoothing = 0.1 }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const requestRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !videoUrl) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const processFrame = () => {
            if (video.paused || video.ended) return;

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Draw scaled video
            ctx.drawImage(video, 0, 0, width, height);

            // Get pixel data
            const frame = ctx.getImageData(0, 0, width, height);
            const data = frame.data;
            const len = data.length;

            for (let i = 0; i < len; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Simple Green Screen Logic
                if (g > tolerance && g > r * (1 + smoothing) && g > b * (1 + smoothing)) {
                    data[i + 3] = 0; // Alpha 0
                }
            }

            ctx.putImageData(frame, 0, 0);
            requestRef.current = requestAnimationFrame(processFrame);
        };

        const startPlayback = async () => {
            try {
                video.currentTime = 0; // Restart
                await video.play();
                requestRef.current = requestAnimationFrame(processFrame);
            } catch (err) {
                console.error("ChromaPet AutoPlay Error:", err);
            }
        };

        video.onloadeddata = () => {
            setIsReady(true);
            startPlayback();
        };

        // If already loaded (cached)
        if (video.readyState >= 3) {
            setIsReady(true);
            startPlayback();
        }

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            video.onloadeddata = null;
        };
    }, [videoUrl, width, height, tolerance, smoothing]);

    if (!videoUrl) return <div style={{ width, height, background: '#000' }} />;

    return (
        <div style={{ width, height, position: 'relative', overflow: 'hidden' }}>
            <video
                ref={videoRef}
                src={videoUrl}
                muted
                loop
                playsInline
                style={{ display: 'none' }}
            />
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{ display: 'block', width: '100%', height: '100%' }}
            />
        </div>
    );
};

export default ChromaPet;
