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
// Bilinear RGB interpolation between 4 corner colors.
// No discrete quadrant assignment — colors blend continuously across all borders.

const MAX_DIST = Math.sqrt(50); // √(5²+5²) = 7.071

// Corner colors in RGB (vivid dark-tone)       [r,   g,   b]
const C_AUTH_LEFT = [185, 35, 35] as const;  // Auth-Planned:  Dark Red
const C_AUTH_RIGHT = [28, 58, 195] as const;  // Auth-Market:   Dark Blue
const C_LIB_LEFT = [33, 150, 48] as const;  // Lib-Planned:   Dark Green
const C_LIB_RIGHT = [158, 130, 22] as const;  // Lib-Market:    Dark Gold
const C_GRAY = [33, 33, 33] as const;  // Center:        Charcoal

function getCellColor(x: number, y: number): string {
    const dist = Math.sqrt(x * x + y * y);
    // t: 0 = center (gray), 1 = extreme corner (full color)
    const t = Math.min(dist / MAX_DIST, 1.0);

    // Normalized position: nx 0=Planned(-5)→1=Market(+5), ny 0=Lib(-5)→1=Auth(+5)
    const nx = (x + 5) / 10;
    const ny = (y + 5) / 10;

    // Bilinear blend of the 4 corner colors
    const blerp = (tl: number, tr: number, bl: number, br: number) =>
        (1 - nx) * (1 - ny) * bl +
        nx * (1 - ny) * br +
        (1 - nx) * ny * tl +
        nx * ny * tr;

    const cr = blerp(C_AUTH_LEFT[0], C_AUTH_RIGHT[0], C_LIB_LEFT[0], C_LIB_RIGHT[0]);
    const cg = blerp(C_AUTH_LEFT[1], C_AUTH_RIGHT[1], C_LIB_LEFT[1], C_LIB_RIGHT[1]);
    const cb = blerp(C_AUTH_LEFT[2], C_AUTH_RIGHT[2], C_LIB_LEFT[2], C_LIB_RIGHT[2]);

    // Blend from gray (center) → vivid corner color (edge)
    const r = Math.round(C_GRAY[0] + t * (cr - C_GRAY[0]));
    const g = Math.round(C_GRAY[1] + t * (cg - C_GRAY[1]));
    const b = Math.round(C_GRAY[2] + t * (cb - C_GRAY[2]));

    return `rgb(${r},${g},${b})`;
}

// ── Canonical 121-cell label lookup (per Architectural Directive §V) ──────────
// Key format: "x,y" where x = economic axis [-5 Command → +5 Commodified]
//                         y = authority axis [+5 Totalitarian → -5 Stateless]

const IDEOLOGY_LABELS: Record<string, string> = {
    // y=+5 Totalitarian
    "-5,5": "Stalinism", "-4,5": "Maoism", "-3,5": "State Capitalism",
    "-2,5": "War Economy", "-1,5": "Command Socialism", "0,5": "Garrison State",
    "1,5": "Corporate Dirigisme", "2,5": "Stratocracy", "3,5": "Cyberpunk Autocracy",
    "4,5": "Techno-Feudalism", "5,5": "Corporate Dystopia",
    // y=+4 Autocratic
    "-5,4": "Juche", "-4,4": "Command Administration", "-3,4": "State Champions",
    "-2,4": "Dirigisme", "-1,4": "Neo-Statism", "0,4": "One-Party State",
    "1,4": "Market Authoritarianism", "2,4": "Crony Capitalism", "3,4": "Plutocracy",
    "4,4": "Oligarchic Capitalism", "5,4": "Private Tyranny",
    // y=+3 Oligarchic
    "-5,3": "Politburo Rule", "-4,3": "Nomenklatura", "-3,3": "Developmentalism",
    "-2,3": "National Synergy", "-1,3": "Social Corporatism", "0,3": "Corporatism",
    "1,3": "Paternalism", "2,3": "Clientelism", "3,3": "Plutocratic Republic",
    "4,3": "Cartel State", "5,3": "Anarcho-Capitalist State",
    // y=+2 Illiberal
    "-5,2": "People's Republic", "-4,2": "State-Led Development", "-3,2": "Guided Economy",
    "-2,2": "Welfare Statism", "-1,2": "Managed Democracy", "0,2": "Illiberal Democracy",
    "1,2": "Soft Autocracy", "2,2": "Neoliberalism", "3,2": "Market Populism",
    "4,2": "Private Statehood", "5,2": "Proprietary Rule",
    // y=+1 Executive
    "-5,1": "National Command", "-4,1": "Central Bureaucracy", "-3,1": "Industrial Policy",
    "-2,1": "New Dealism", "-1,1": "Third Way", "0,1": "Executive Republic",
    "1,1": "Liberal Democracy", "2,1": "Neoliberalism", "3,1": "Hyper-Privatization",
    "4,1": "Contractualism", "5,1": "Market Hegemony",
    // y=0 Constitutional
    "-5,0": "Council Republic", "-4,0": "Planned Democracy", "-3,0": "Social Democracy",
    "-2,0": "Welfare State", "-1,0": "Rhine Capitalism", "0,0": "Liberalism",
    "1,0": "Market Democracy", "2,0": "Laissez-Faire Republic", "3,0": "Market Constitutionalism",
    "4,0": "Galt's Gulch", "5,0": "Contract State",
    // y=-1 Decentralized
    "-5,-1": "Idealized Soviet", "-4,-1": "Local Planning", "-3,-1": "Guild Socialism",
    "-2,-1": "Distributism", "-1,-1": "Social Liberalism", "0,-1": "Federalism",
    "1,-1": "Minarchism", "2,-1": "Polycentric Law", "3,-1": "Voluntarism",
    "4,-1": "Free Banking", "5,-1": "Market Anarchy",
    // y=-2 Minimalist
    "-5,-2": "Minarchist Commune", "-4,-2": "Syndicalism", "-3,-2": "Mutualism",
    "-2,-2": "Georgism", "-1,-2": "Civil Society", "0,-2": "Classical Liberalism",
    "1,-2": "Night-Watchman State", "2,-2": "Agorism", "3,-2": "Panarchism",
    "4,-2": "Private Law Society", "5,-2": "Contract Society",
    // y=-3 Watchman
    "-5,-3": "Communitarianism", "-4,-3": "Cooperative Federation", "-3,-3": "Left-Agorism",
    "-2,-3": "Market Socialism", "-1,-3": "Libertarianism", "0,-3": "Minarchism",
    "1,-3": "Watchman State", "2,-3": "Anarcho-Capitalism Lite", "3,-3": "Voluntarism",
    "4,-3": "Private Cities", "5,-3": "Market Order",
    // y=-4 Autonomous
    "-5,-4": "Autonomous Zone", "-4,-4": "Collective", "-3,-4": "Communes",
    "-2,-4": "Cooperative Federation", "-1,-4": "Mutualism", "0,-4": "Free Territory",
    "1,-4": "Autonomy", "2,-4": "Agorist Cell", "3,-4": "Voluntarism",
    "4,-4": "Privatism", "5,-4": "Anarcho-Capitalism",
    // y=-5 Stateless
    "-5,-5": "Pure Communism", "-4,-5": "Gift Economy", "-3,-5": "Left-Anarchism",
    "-2,-5": "Collectivism", "-1,-5": "Distributism", "0,-5": "Anarchism",
    "1,-5": "Individualism", "2,-5": "Agorism", "3,-5": "Voluntarism",
    "4,-5": "Market Anarchism", "5,-5": "Anarcho-Capitalism",
};

function getIdeologyLabel(x: number, y: number): string {
    return IDEOLOGY_LABELS[`${x},${y}`] ?? `(${x},${y})`;
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

    // Escape key to close (universal fullscreen exit hatch)
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

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
                    data-testid="close-ideology-grid"
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-800 transition-colors text-[9px] uppercase tracking-wider"
                >
                    <X className="w-3 h-3" />
                    <span>ESC</span>
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
                            data-testid="ideology-grid-cells"
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
                                const label = getIdeologyLabel(x, y);

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
                                                {getIdeologyLabel(x, y)}
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
                                                <div className="text-[13px] text-white font-mono mb-0.5">{label}</div>
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
