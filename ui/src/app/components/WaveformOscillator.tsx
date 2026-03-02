"use client";

import { useEffect, useRef } from "react";

interface WaveformProps {
    volatility: number;
    fearIndex: number;
}

export default function WaveformOscillator({ volatility, fearIndex }: WaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        let offset = 0;

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const width = canvas.width;
            const height = canvas.height;
            const midY = height / 2;

            // Amplitude tied to Volatility, Frequency tied to Fear Index + Volatility
            const amplitude = Math.max(10, volatility * 0.8);
            const frequency = 0.02 + (fearIndex * 0.001);

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#FFB000"; // Amber Accent
            ctx.shadowBlur = 10;
            ctx.shadowColor = "rgba(255, 176, 0, 0.5)";

            for (let x = 0; x < width; x++) {
                const y = midY + Math.sin(x * frequency + offset) * amplitude;
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.stroke();

            // Drifting speed
            offset += 0.05 + (volatility * 0.002);
            animationId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationId);
    }, [volatility, fearIndex]);

    return (
        <div className="w-full h-full flex items-center justify-center">
            <canvas
                ref={canvasRef}
                width={800}
                height={200}
                className="w-full h-auto"
            />
        </div>
    );
}
