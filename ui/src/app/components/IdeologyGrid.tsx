"use client";

import React, { useMemo, useState, useCallback } from "react";
import { X, Flame, GitCommit, Eye } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface IdeologyGridProps {
    currentPos?: [number, number];
    perceivedPos?: [number, number];
    positionHistory?: [number, number][];
    flavorLabel?: string;
    perceivedFlavorLabel?: string;
    onClose: () => void;
}

// ── Color math (per UI_PRINCIPLES.md §III) ────────────────────────────────────

const MAX_DIST = Math.sqrt(50); // √(5²+5²) = 7.071

function getCellColor(x: number, y: number): string {
    const dist = Math.sqrt(x * x + y * y);
    const sat = Math.min((dist / MAX_DIST) * 100, 100);
    // Center → dark gray
    if (dist < 0.9) return "hsl(0,0%,13%)";
    // Quadrant hues: Auth-Right=215 Blue, Auth-Left=2 Red, Lib-Left=125 Green, Lib-Right=48 Yellow
    let hue = 215;
    if (x < 0 && y >= 0) hue = 2;
    if (x < 0 && y < 0) hue = 125;
    if (x >= 0 && y < 0) hue = 48;
    return `hsl(${hue},${sat.toFixed(0)}%,32%)`;
}

// ── Comprehensive ideology label lookup ───────────────────────────────────────
// Covers all 121 (x,y) cells from [-5,5]×[-5,5].
// Prioritizes named ideologies; fills gaps with descriptive compound labels.

function getIdeologyLabel(x: number, y: number): string {
    const dist = Math.sqrt(x * x + y * y);

    // ── Center ───────────────────────────────────────────────────────────────
    if (dist < 1.0) return "Liberalism";

    // ── Corner extremes ───────────────────────────────────────────────────────
    if (x >= 4 && y >= 4) return "Fascism";
    if (x <= -4 && y >= 4) return "Stalinism";
    if (x >= 4 && y <= -4) return "Anarcho-Capitalism";
    if (x <= -4 && y <= -4) return "Anarcho-Communism";

    // ── Edge extremes ─────────────────────────────────────────────────────────
    if (y >= 4 && x > -3 && x < 3) return "Totalitarianism";
    if (y <= -4 && x > -3 && x < 3) return "Anarchism";
    if (x >= 4 && y > -3 && y < 3) return "Neoliberalism";
    if (x <= -4 && y > -3 && y < 3) return "Communism";

    // ── Near-edge transitions on axes ────────────────────────────────────────
    if (y >= 3 && x >= 2) return "National Conservatism";
    if (y >= 3 && x <= -2) return "Marxism-Leninism";
    if (y <= -3 && x >= 2) return "Libertarianism";
    if (y <= -3 && x <= -2) return "Anarcho-Syndicalism";

    // ── Quadrant moderates (by dominant axis) ────────────────────────────────
    const isRight = x > 0;
    const isAuth = y > 0;
    const strongX = Math.abs(x) >= 3;
    const strongY = Math.abs(y) >= 3;
    const mild = dist <= 2.0;

    if (isAuth && isRight) {
        if (mild) return "Centre-Right";
        if (strongY && !strongX) return "Authoritarianism";
        if (strongX && !strongY) return "Nat. Conservatism";
        return "Conservatism";
    }
    if (isAuth && !isRight) {
        if (mild) return "Centre-Left";
        if (strongY && !strongX) return "State Socialism";
        if (strongX && !strongY) return "Marxism";
        return "Soc. Democracy";
    }
    if (!isAuth && isRight) {
        if (mild) return "Liberal Democracy";
        if (strongY && !strongX) return "Classical Liberalism";
        if (strongX && !strongY) return "Libertarianism";
        return "Social Liberalism";
    }
    // Lib-Left
    if (mild) return "Progressivism";
    if (strongY && !strongX) return "Left-Anarchism";
    if (strongX && !strongY) return "Eco-Socialism";
    return "Green Politics";
}

function getShortLabel(x: number, y: number): string {
    const full = getIdeologyLabel(x, y);
    // Abbreviate to fit in cell
    const abbrevMap: Record<string, string> = {
        "National Conservatism": "Nat. Con.",
        "Marxism-Leninism": "Marxism-L",
        "Anarcho-Capitalism": "Anarch-Cap",
        "Anarcho-Communism": "Anarch-Com",
        "Anarcho-Syndicalism": "Anarchosyn.",
        "Totalitarianism": "Totalit.",
        "Liberal Democracy": "Lib. Dem.",
        "Social Liberalism": "Soc. Lib.",
        "Classical Liberalism": "Class. Lib.",
        "Soc. Democracy": "Soc. Dem.",
        "State Socialism": "State Soc.",
        "Left-Anarchism": "Left-Anarch",
        "Centre-Right": "Ctr-Right",
        "Centre-Left": "Ctr-Left",
    };
    return abbrevMap[full] ?? full;
}

// ── Filter config (Grid filter removed — labels always shown) ─────────────────

const FILTERS = [
    { id: "heatmap", icon: Flame, label: "Faction Heatmap" },
    { id: "trajectory", icon: GitCommit, label: "Trajectory" },
    { id: "veil", icon: Eye, label: "Veil Overlay" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

// ── Component ─────────────────────────────────────────────────────────────────

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

    const cells = useMemo(() => {
        const result = [];
        for (let y = 5; y >= -5; y--)
            for (let x = -5; x <= 5; x++)
                result.push({ x, y });
        return result;
    }, []);

    const historySet = useMemo(() =>
        new Set(positionHistory.map(([x, y]) => `${Math.round(x)},${Math.round(y)}`)),
        [positionHistory]
    );

    const realCell = currentPos ? { x: Math.round(currentPos[0]), y: Math.round(currentPos[1]) } : null;
    const perceivedCell = perceivedPos ? { x: Math.round(perceivedPos[0]), y: Math.round(perceivedPos[1]) } : null;

    return (
        <div className="fixed inset-0 z-[1000] flex flex-col bg-[#05070a] font-mono select-none">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-amber-400 uppercase tracking-widest">
                        Ideology Matrix — Full Spectrum View
                    </span>
                    {flavorLabel && (
                        <span className="text-[9px] text-amber-400/60 border border-amber-400/20 px-2 py-0.5">
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
                    className="p-1.5 border border-slate-700 text-slate-500 hover:text-red-400 hover:border-red-800 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* ── Main area: centered square grid ──────────────────────── */}
            <div className="flex-1 flex items-center justify-center min-h-0 p-4">
                <div className="flex flex-col items-center gap-1 h-full max-h-full"
                    style={{ aspectRatio: "1 / 1" }}>

                    <div className="text-[8px] text-slate-500 uppercase tracking-widest shrink-0">Authoritarian</div>

                    <div className="flex items-center gap-1.5 flex-1 w-full min-h-0">
                        <div className="text-[8px] text-slate-500 uppercase tracking-widest shrink-0"
                            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                            Planned Economy
                        </div>

                        {/* Grid — fills remaining square space */}
                        <div
                            className="flex-1 h-full border border-slate-800 relative"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(11, 1fr)",
                                gridTemplateRows: "repeat(11, 1fr)",
                            }}
                        >
                            {cells.map(({ x, y }) => {
                                const isReal = realCell?.x === x && realCell?.y === y;
                                const isPerceived = perceivedCell?.x === x && perceivedCell?.y === y;
                                const isHistory = activeFilters.has("trajectory") && historySet.has(`${x},${y}`);
                                const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;
                                const fullLabel = getIdeologyLabel(x, y);
                                const shortLabel = getShortLabel(x, y);

                                return (
                                    <div
                                        key={`${x}-${y}`}
                                        className="relative border border-black/25 cursor-crosshair overflow-visible"
                                        style={{
                                            backgroundColor: getCellColor(x, y),
                                            outline: isHovered ? "1px solid rgba(255,255,255,0.55)" : undefined,
                                            boxShadow: isHovered ? "0 0 10px rgba(255,255,255,0.12)" : undefined,
                                            zIndex: isHovered ? 10 : undefined,
                                        }}
                                        onMouseEnter={() => setHoveredCell({ x, y })}
                                        onMouseLeave={() => setHoveredCell(null)}
                                    >
                                        {/* Always-visible ideology label */}
                                        <div className="absolute inset-0 flex items-center justify-center p-[3px] pointer-events-none">
                                            <span
                                                className="text-center leading-tight text-white/70 font-mono"
                                                style={{ fontSize: "clamp(9px, 1.15vw, 13px)" }}
                                            >
                                                {shortLabel}
                                            </span>
                                        </div>

                                        {/* Real position diamond */}
                                        {isReal && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                                <div className="w-3 h-3 bg-amber-400 rotate-45 shadow-[0_0_14px_rgba(255,176,0,1)]" />
                                            </div>
                                        )}

                                        {/* Perceived position ring */}
                                        {isPerceived && !isReal && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                                                <div className="w-3 h-3 border-2 border-orange-400 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.7)]" />
                                            </div>
                                        )}

                                        {/* Trajectory dot */}
                                        {isHistory && !isReal && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/35" />
                                            </div>
                                        )}

                                        {/* Hover tooltip */}
                                        {isHovered && (
                                            <div
                                                className="absolute z-50 bg-[#0d1017] border border-slate-600 px-2.5 py-1.5 whitespace-nowrap pointer-events-none shadow-xl"
                                                style={{
                                                    bottom: "calc(100% + 4px)",
                                                    left: "50%",
                                                    transform: "translateX(-50%)",
                                                }}
                                            >
                                                <div className="text-[13px] text-white font-mono mb-0.5">{fullLabel}</div>
                                                <div className="text-[8px] text-slate-500">
                                                    {x > 0 ? "+" : ""}{x},{y > 0 ? "+" : ""}{y}
                                                    &nbsp;·&nbsp;
                                                    {x >= 0 ? "Market" : "Planned"} / {y >= 0 ? "Auth." : "Lib."}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="text-[8px] text-slate-500 uppercase tracking-widest shrink-0"
                            style={{ writingMode: "vertical-lr" }}>
                            Market Economy
                        </div>
                    </div>

                    <div className="text-[8px] text-slate-500 uppercase tracking-widest shrink-0">Libertarian</div>
                </div>
            </div>

            {/* ── Filter Bar ─────────────────────────────────────────────── */}
            <div className="shrink-0 border-t border-slate-800 px-6 py-2.5 flex items-center justify-center gap-3">
                <span className="text-[8px] text-slate-600 uppercase tracking-widest mr-2">Overlays</span>
                {FILTERS.map(({ id, icon: Icon, label }) => {
                    const active = activeFilters.has(id);
                    return (
                        <button
                            key={id}
                            onClick={() => toggleFilter(id)}
                            title={label}
                            className={`flex items-center gap-1.5 px-3 py-1.5 border text-[9px] uppercase tracking-wider transition-all duration-150 ${active
                                ? "border-amber-400/50 text-amber-400 bg-amber-400/5"
                                : "border-slate-800 text-slate-600 hover:text-slate-400 hover:border-slate-700"
                                }`}
                        >
                            <Icon className="w-3 h-3" />
                            {label}
                        </button>
                    );
                })}
                <span className="ml-4 text-[8px] text-slate-700 border-l border-slate-800 pl-4">
                    ◆ Real Position &nbsp;&nbsp; ○ Perceived &nbsp;&nbsp; · Trail
                </span>
            </div>
        </div>
    );
};
