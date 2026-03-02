"use client";

import React, { useEffect, useRef } from "react";

interface WaveformOscillatorProps {
    volatility: number;
    fearIndex: number;
    history: number[];  // ECG: actual backend history array
}

const WaveformOscillator = ({ volatility, fearIndex, history }: WaveformOscillatorProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        const midY = h / 2;

        ctx.clearRect(0, 0, w, h);

        // Background grid lines (subtle)
        ctx.strokeStyle = "rgba(255,176,0,0.05)";
        ctx.lineWidth = 0.5;
        for (let y = 0; y < h; y += h / 4) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        const dataPoints = history.length > 1 ? history : Array(60).fill(volatility);
        const maxVol = 100;

        // Draw ECG line
        ctx.beginPath();
        ctx.strokeStyle = volatility > 40 ? "#FF4444" : volatility > 15 ? "#FFB000" : "rgba(255,176,0,0.5)";
        ctx.lineWidth = 1.5;
        ctx.shadowColor = volatility > 40 ? "#FF4444" : "#FFB000";
        ctx.shadowBlur = volatility > 15 ? 8 : 2;

        const step = w / Math.max(dataPoints.length, 60);
        dataPoints.forEach((vol, i) => {
            const x = i * step;
            // Normalize: flat line at midY when vol=0, amplitude scales with vol
            const amplitude = (vol / maxVol) * (midY * 0.8);
            const y = midY - amplitude;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Draw center baseline (flatline reference)
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,176,0,0.08)";
        ctx.lineWidth = 0.5;
        ctx.shadowBlur = 0;
        ctx.moveTo(0, midY);
        ctx.lineTo(w, midY);
        ctx.stroke();

    }, [history, volatility, fearIndex]);

    return (
        <canvas
            ref={canvasRef}
            width={600}
            height={100}
            className="w-full h-full"
        />
    );
};

export default WaveformOscillator;
