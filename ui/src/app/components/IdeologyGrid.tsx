"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Grid3X3, Flame, GitCommit, Eye } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface IdeologyGridProps {
    currentPos?: [number, number];      // [econ_x, auth_y] in [-5,5]
    perceivedPos?: [number, number];
    positionHistory?: [number, number][];
    flavorLabel?: string;
    perceivedFlavorLabel?: string;
    /** Called by parent on close — parent decides whether to resume game */
    onClose: () => void;
    /** Callback to get label from engine's 121-cell lookup */
    getLabelAt?: (x: number, y: number) => string;
}

// ── Color math ────────────────────────────────────────────────────────────────

const MAX_DIST = Math.sqrt(5 * 5 + 5 * 5); // 7.07

function getQuadrantHue(x: number, y: number): number {
    // y+ = Authoritarian (top), y- = Libertarian (bottom)
    // x+ = Market (right), x- = Planned (left)
    if (x >= 0 && y >= 0) return 210; // Auth-Right: Blue
    if (x < 0 && y >= 0) return 0;    // Auth-Left: Red/Crimson
    if (x < 0 && y < 0) return 128;   // Lib-Left: Green
    return 50;                          // Lib-Right: Yellow
}

function getCellColor(x: number, y: number): string {
    const dist = Math.sqrt(x * x + y * y);
    const saturation = Math.min((dist / MAX_DIST) * 100, 100);
    const hue = getQuadrantHue(x, y);
    // Center cells go to dark gray, corners to full saturation
    if (dist < 0.9) return "hsl(0, 0%, 14%)";
    return `hsl(${hue}, ${saturation.toFixed(0)}%, 32%)`;
}

function engineToGrid(x: number, y: number): { col: number; row: number } {
    // x in [-5,5] → col 0..10, y in [-5,5] → row 0..10 (y+ = top = row 0)
    return { col: x + 5, row: 5 - y };
}

// ── Filter bar config ─────────────────────────────────────────────────────────

const FILTERS = [
    { id: "grid", icon: Grid3X3, label: "Grid Labels" },
    { id: "heatmap", icon: Flame, label: "Faction Heatmap" },
    { id: "trajectory", icon: GitCommit, label: "Trajectory" },
    { id: "veil", icon: Eye, label: "Veil Overlay" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

// ── Component ─────────────────────────────────────────────────────────────────

// Minimal ideology label lookup (abbreviated — full 121 labels from engine in production)
const IDEOLOGY_LABELS: Record<string, string> = {
    "0,0": "Liberalism", "5,5": "Fascism", "-5,5": "Stalinism",
    "-5,-5": "Anarcho-Communism", "5,-5": "Anarcho-Capitalism",
    "3,3": "Conservatism", "-3,3": "Marxism-Leninism",
    "3,-3": "Libertarianism", "-3,-3": "Left-Libertarianism",
    "0,4": "Authoritarian Centrism", "0,-4": "Libertarian Centrism",
    "4,0": "Liberal Democracy", "-4,0": "Communism",
};

function getLabelAt(x: number, y: number): string {
    return IDEOLOGY_LABELS[`${x},${y}`] ?? `(${x}, ${y})`;
}

export const IdeologyGrid = ({
    currentPos,
    perceivedPos,
    positionHistory = [],
    flavorLabel,
    perceivedFlavorLabel,
    onClose,
}: IdeologyGridProps) => {
    const [activeFilters, setActiveFilters] = useState<Set<FilterId>>(new Set(["trajectory"]));
    const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

    const toggleFilter = useCallback((id: FilterId) => {
        setActiveFilters(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);

    // Build 11×11 grid coords: y from +5 (top) → -5 (bottom)
    const cells = useMemo(() => {
        const result = [];
        for (let y = 5; y >= -5; y--) {
            for (let x = -5; x <= 5; x++) {
                result.push({ x, y });
            }
        }
        return result;
    }, []);

    // History set for trajectory overlay
    const historySet = useMemo(() => {
        return new Set(positionHistory.map(([x, y]) => `${Math.round(x)},${Math.round(y)}`));
    }, [positionHistory]);

    const realCell = currentPos
        ? { x: Math.round(currentPos[0]), y: Math.round(currentPos[1]) }
        : null;
    const perceivedCell = perceivedPos
        ? { x: Math.round(perceivedPos[0]), y: Math.round(perceivedPos[1]) }
        : null;

    return (
        <div className="fixed inset-0 z-[1000] flex flex-col bg-[#05070a] font-mono">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] text-amber-accent uppercase tracking-widest">
                        Ideology Matrix — Fullscreen
                    </span>
                    {flavorLabel && (
                        <span className="text-[9px] text-amber-accent/70 border border-amber-accent/20 px-2 py-0.5">
                            {flavorLabel}
                        </span>
                    )}
                    {perceivedFlavorLabel && perceivedFlavorLabel !== flavorLabel && (
                        <span className="text-[9px] text-slate-500 italic border border-slate-700 px-2 py-0.5">
                            PERCEIVED: {perceivedFlavorLabel}
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 border border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-900/50 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* ── Axis Labels ────────────────────────────────────────────── */}
            <div className="relative flex-1 flex flex-col items-center justify-center px-12 py-6 gap-2 min-h-0">
                <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-1">Authoritarian</div>

                <div className="flex items-center gap-2 flex-1 w-full max-w-4xl min-h-0">
                    <div className="text-[8px] text-slate-600 uppercase tracking-widest -rotate-90 whitespace-nowrap">Planned Economy</div>

                    {/* ── The Grid ───────────────────────────────────────── */}
                    <div
                        className="grid flex-1 h-full border border-slate-800"
                        style={{ gridTemplateColumns: "repeat(11, 1fr)", gridTemplateRows: "repeat(11, 1fr)" }}
                    >
                        {cells.map(({ x, y }) => {
                            const isReal = realCell?.x === x && realCell?.y === y;
                            const isPerceived = perceivedCell?.x === x && perceivedCell?.y === y;
                            const isHistory = activeFilters.has("trajectory") && historySet.has(`${x},${y}`);
                            const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;
                            const bg = getCellColor(x, y);

                            return (
                                <div
                                    key={`${x}-${y}`}
                                    className="relative border border-black/30 cursor-crosshair transition-all duration-100 group"
                                    style={{
                                        backgroundColor: bg,
                                        boxShadow: isHovered ? "inset 0 0 0 1px rgba(255,255,255,0.6), 0 0 12px rgba(255,255,255,0.15)" : undefined,
                                    }}
                                    onMouseEnter={() => setHoveredCell({ x, y })}
                                    onMouseLeave={() => setHoveredCell(null)}
                                >
                                    {/* Real position */}
                                    {isReal && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-3 h-3 bg-amber-400 rotate-45 shadow-[0_0_12px_rgba(255,176,0,0.9)]" />
                                        </div>
                                    )}
                                    {/* Perceived position */}
                                    {isPerceived && !isReal && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-3 h-3 border-2 border-orange-400 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                                        </div>
                                    )}
                                    {/* History dot */}
                                    {isHistory && !isReal && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40" />
                                        </div>
                                    )}
                                    {/* Grid label */}
                                    {activeFilters.has("grid") && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-[5.5px] text-white/40 text-center leading-tight px-0.5">
                                                {getLabelAt(x, y)}
                                            </span>
                                        </div>
                                    )}
                                    {/* Hover tooltip */}
                                    {isHovered && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 bg-slate-900 border border-slate-700 px-2 py-1 whitespace-nowrap pointer-events-none">
                                            <div className="text-[9px] text-amber-accent">{getLabelAt(x, y)}</div>
                                            <div className="text-[8px] text-slate-500">({x}, {y})</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="text-[8px] text-slate-600 uppercase tracking-widest rotate-90 whitespace-nowrap">Market Economy</div>
                </div>

                <div className="text-[8px] text-slate-600 uppercase tracking-widest mt-1">Libertarian</div>
            </div>

            {/* ── Filter Bar ─────────────────────────────────────────────── */}
            <div className="shrink-0 border-t border-slate-800 px-6 py-3 flex items-center justify-center gap-3">
                <span className="text-[8px] text-slate-600 uppercase tracking-widest mr-2">Filters</span>
                {FILTERS.map(({ id, icon: Icon, label }) => {
                    const active = activeFilters.has(id);
                    return (
                        <button
                            key={id}
                            onClick={() => toggleFilter(id)}
                            title={label}
                            className={`flex items-center gap-1.5 px-3 py-1.5 border text-[9px] uppercase tracking-wider font-mono transition-all duration-150 ${active
                                    ? "border-amber-accent/50 text-amber-accent bg-amber-accent/5 shadow-[0_0_8px_rgba(255,176,0,0.1)]"
                                    : "border-slate-800 text-slate-600 hover:text-slate-400 hover:border-slate-700"
                                }`}
                        >
                            <Icon className="w-3 h-3" />
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
