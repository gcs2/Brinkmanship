"use client";

import React, { useMemo, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IdeologyCompassProps {
    // Core position (existing)
    authoritarianLibertarian: number; // -1.0 (Auth) to 1.0 (Lib)
    plannedMarket: number;            // -1.0 (Planned) to 1.0 (Market)
    overtonRadius: number;            // 0.1 to 0.5

    // Phase 17 — IDX-011: Breadcrumb Trail
    positionHistory?: [number, number][];     // Array of [econ_x, auth_y] in [-5,5] space

    // Phase 17 — IDX-010: Deep State Delta
    perceivedPosition?: [number, number];     // [econ_x, auth_y] in [-5,5] space
    veilGap?: number;                         // euclidean gap; > 2.5 orange, > 3.5 red

    // Phase 17 — IDX-005: Dual Flavor Labels
    flavorLabel?: string;
    perceivedFlavorLabel?: string;

    // Phase 17 — IDX-009: Velocity Shock
    velocityShock?: boolean;
}

// Maps [-5, +5] engine coords to [0, 100]% compass coords
function engineToPercent(econ: number, auth: number): { x: number; y: number } {
    const x = ((econ + 5) / 10) * 100;
    const y = ((5 - auth) / 10) * 100; // auth+ = top of compass, auth- = bottom
    return { x, y };
}

const IdeologyCompass = ({
    authoritarianLibertarian,
    plannedMarket,
    overtonRadius,
    positionHistory = [],
    perceivedPosition,
    veilGap = 0,
    flavorLabel,
    perceivedFlavorLabel,
    velocityShock = false,
}: IdeologyCompassProps) => {
    const [showShock, setShowShock] = useState(false);

    // Real position in % space (from normalized -1..1 props, for backward compat)
    const x = ((plannedMarket + 1) / 2) * 100;
    const y = ((1 - authoritarianLibertarian) / 2) * 100;

    // Perceived position in % space (from engine [-5,5] space)
    const perceived = useMemo(() => {
        if (!perceivedPosition) return null;
        return engineToPercent(perceivedPosition[0], perceivedPosition[1]);
    }, [perceivedPosition]);

    // Breadcrumb trail in % space
    const crumbs = useMemo(() => {
        return positionHistory.map(([econ, auth]) => engineToPercent(econ, auth));
    }, [positionHistory]);

    // Tension line color based on veil gap
    const tensionColor = useMemo(() => {
        if (veilGap >= 3.5) return "#FF2222";
        if (veilGap >= 2.5) return "#F97316";
        return "rgba(251,191,36,0.4)";
    }, [veilGap]);

    // Velocity shock: trigger animation for 2.5s
    useEffect(() => {
        if (velocityShock) {
            setShowShock(true);
            const t = setTimeout(() => setShowShock(false), 2500);
            return () => clearTimeout(t);
        }
    }, [velocityShock]);

    const gridLines = useMemo(() => {
        const lines = [];
        for (let i = 0; i <= 10; i++) lines.push(i * 10);
        return lines;
    }, []);

    return (
        <div className="relative w-full aspect-square bg-slate-950 border border-slate-900 overflow-hidden font-mono group">

            {/* ── Chronos Sweep scanline ─────────────────────────────────────── */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-50"
                style={{
                    background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
                    backgroundSize: "100% 4px",
                }}
                animate={{ backgroundPositionY: ["0%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            {/* ── Brutalist Grid ─────────────────────────────────────────────── */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                {gridLines.map((line) => (
                    <React.Fragment key={line}>
                        <div className="absolute top-0 bottom-0 border-l border-slate-700" style={{ left: `${line}%` }} />
                        <div className="absolute left-0 right-0 border-t border-slate-700" style={{ top: `${line}%` }} />
                    </React.Fragment>
                ))}
            </div>

            {/* ── Axis Labels ────────────────────────────────────────────────── */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] text-slate-600 uppercase tracking-tighter">Authoritarian</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-slate-600 uppercase tracking-tighter">Libertarian</div>
            <div className="absolute left-2 top-1/2 -rotate-90 origin-left -translate-y-1/2 text-[8px] text-slate-600 uppercase tracking-tighter">Planned</div>
            <div className="absolute right-2 top-1/2 rotate-90 origin-right translate-y-1/2 text-[8px] text-slate-600 uppercase tracking-tighter">Market</div>

            {/* ── Overton Window Ring ─────────────────────────────────────────── */}
            <motion.div
                initial={false}
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute border border-amber-accent/40 rounded-full bg-amber-accent/5 pointer-events-none"
                style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: `${overtonRadius * 200}%`,
                    height: `${overtonRadius * 200}%`,
                    transform: "translate(-50%, -50%)",
                }}
            />

            {/* ── IDX-011: Breadcrumb Comet Trail ─────────────────────────────── */}
            {crumbs.map((crumb, i) => {
                const opacity = 0.05 + (i / Math.max(crumbs.length - 1, 1)) * 0.65;
                const size = 3 + (i / Math.max(crumbs.length - 1, 1)) * 3;
                return (
                    <div
                        key={i}
                        className="absolute rounded-full pointer-events-none"
                        style={{
                            left: `${crumb.x}%`,
                            top: `${crumb.y}%`,
                            width: `${size}px`,
                            height: `${size}px`,
                            transform: "translate(-50%, -50%)",
                            backgroundColor: `rgba(251, 191, 36, ${opacity})`,
                            boxShadow: i === crumbs.length - 1 ? "0 0 6px rgba(251,191,36,0.3)" : "none",
                        }}
                    />
                );
            })}

            {/* ── IDX-010: Perceived Position Ring + Tension Line ─────────────── */}
            {perceived && (
                <>
                    {/* Tension line from perceived to real */}
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                    >
                        <motion.line
                            x1={perceived.x} y1={perceived.y}
                            x2={x} y2={y}
                            stroke={tensionColor}
                            strokeWidth="0.4"
                            strokeDasharray="1.5,1"
                            animate={{ opacity: veilGap >= 3.5 ? [0.6, 1.0, 0.6] : 0.6 }}
                            transition={{ duration: 0.8, repeat: veilGap >= 3.5 ? Infinity : 0 }}
                        />
                    </svg>

                    {/* Hollow perceived position ring */}
                    <motion.div
                        animate={{
                            left: `${perceived.x}%`,
                            top: `${perceived.y}%`,
                            boxShadow: veilGap >= 3.5
                                ? ["0 0 8px rgba(255,34,34,0.6)", "0 0 16px rgba(255,34,34,0.9)", "0 0 8px rgba(255,34,34,0.6)"]
                                : `0 0 8px ${tensionColor}`,
                        }}
                        transition={{
                            left: { type: "spring", stiffness: 40, damping: 20 },
                            top: { type: "spring", stiffness: 40, damping: 20 },
                            boxShadow: { duration: 0.7, repeat: veilGap >= 3.5 ? Infinity : 0 },
                        }}
                        className="absolute w-4 h-4 rounded-full border-2 pointer-events-none"
                        style={{
                            borderColor: tensionColor,
                            backgroundColor: "transparent",
                            transform: "translate(-50%, -50%)",
                        }}
                    />
                </>
            )}

            {/* ── Real Position Crosshair ─────────────────────────────────────── */}
            <motion.div
                initial={false}
                animate={{ left: `${x}%`, top: `${y}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                className="absolute w-2 h-2 -ml-1 -mt-1"
            >
                <div className="absolute inset-x-0 top-1/2 h-[1px] bg-amber-accent/50 -translate-y-1/2 w-8 -left-3" />
                <div className="absolute inset-y-0 left-1/2 w-[1px] bg-amber-accent/50 -translate-x-1/2 h-8 -top-3" />
                <div className="w-full h-full bg-amber-accent border border-white/50 rotate-45 shadow-[0_0_10px_rgba(255,191,0,0.5)]" />
            </motion.div>

            {/* ── IDX-009: Velocity Shock Banner ──────────────────────────────── */}
            <AnimatePresence>
                {showShock && (
                    <motion.div
                        initial={{ opacity: 0, scaleY: 0.8 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        exit={{ opacity: 0, scaleY: 0.8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute inset-x-0 top-1/3 z-40 flex flex-col items-center pointer-events-none"
                    >
                        {/* CRT distortion overlay */}
                        <motion.div
                            className="absolute inset-0 pointer-events-none"
                            animate={{ opacity: [0.15, 0.35, 0.15, 0.3, 0.15] }}
                            transition={{ duration: 0.25, repeat: 5 }}
                            style={{
                                background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,34,34,0.07) 2px, rgba(255,34,34,0.07) 4px)",
                            }}
                        />
                        <div className="bg-red-900/80 border border-red-500/60 px-4 py-1.5 text-[10px] font-mono text-red-300 uppercase tracking-widest backdrop-blur-sm">
                            ⚡ POLITICAL SHOCK
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Data Readout Overlay (hover) ─────────────────────────────────── */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <span className="text-[8px] text-amber-accent/80">
                    COORDS: {plannedMarket.toFixed(2)}, {authoritarianLibertarian.toFixed(2)}
                </span>
                <span className="text-[8px] text-slate-500">
                    OVERTON: ±{overtonRadius.toFixed(2)}
                </span>
                {flavorLabel && (
                    <span className="text-[8px] text-amber-accent/90 uppercase tracking-wide mt-0.5">
                        LABEL: {flavorLabel}
                    </span>
                )}
                {perceivedFlavorLabel && perceivedFlavorLabel !== flavorLabel && (
                    <span className="text-[8px] text-slate-400/70 italic uppercase tracking-wide">
                        PERCEIVED: {perceivedFlavorLabel}
                    </span>
                )}
                {veilGap > 0 && (
                    <span
                        className="text-[8px] uppercase tracking-wide"
                        style={{ color: tensionColor }}
                    >
                        VEIL GAP: {veilGap.toFixed(2)}{veilGap >= 3.5 ? " ⚠ COLLAPSE" : ""}
                    </span>
                )}
            </div>
        </div>
    );
};

export default IdeologyCompass;
