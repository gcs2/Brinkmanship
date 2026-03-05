"use client";

import React from "react";
import { ShieldAlert, Zap, Activity, Users, Flag } from "lucide-react";

interface CountryProfileProps {
    gameState: any;
    config: any;
}

const StatRow = ({ label, value, color = "text-[#e0e0e0]" }: { label: string; value: string | number; color?: string }) => (
    <div className="flex items-baseline justify-between py-2 border-b border-slate-800/60 last:border-0">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{label}</span>
        <span className={`text-sm font-mono ${color}`}>{value}</span>
    </div>
);

export const CountryProfile = ({ gameState, config }: CountryProfileProps) => {
    if (!gameState) {
        return (
            <div className="flex items-center justify-center h-full text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                No Data — Engine Offline
            </div>
        );
    }

    const profile = gameState.player_profile;
    const ideology = gameState.player_ideology;
    const system = gameState.system;
    const metrics = gameState.formatted_metrics ?? [];

    const aut = metrics.find((m: any) => m.id === "authority")?.value ?? "—";
    const stb = metrics.find((m: any) => m.id === "stability")?.value ?? "—";
    const app = metrics.find((m: any) => m.id === "approval")?.value ?? "—";

    const flavorLabel = ideology?.flavor_label ?? "Unknown";
    const perceivedLabel = ideology?.perceived_flavor_label;

    // Quadrant color from ideology position
    const ex = ideology?.planned_market ?? 0;
    const ey = ideology?.authoritarian_libertarian ?? 0;
    let quadrantColor = "#FFB000";
    if (ex >= 0 && ey >= 0) quadrantColor = "#3B82F6";
    if (ex < 0 && ey >= 0) quadrantColor = "#EF4444";
    if (ex < 0 && ey < 0) quadrantColor = "#22C55E";
    if (ex >= 0 && ey < 0) quadrantColor = "#EAB308";

    return (
        <div className="flex flex-col h-full font-mono bg-[#0a0c10]">

            {/* ── Sovereign Header ─────────────────────────────────────── */}
            <div className="px-4 py-4 border-b border-slate-800 bg-[#0d1017]">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 border border-slate-700 flex items-center justify-center bg-slate-800/50">
                        <Flag className="w-5 h-5 text-amber-accent/70" />
                    </div>
                    <div>
                        <div className="text-sm font-mono text-[#e0e0e0] tracking-wide">
                            {profile?.name ?? "SOVEREIGN"}
                        </div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest">
                            {profile?.title ?? config?.theme_name ?? "Gulf Sovereign"}
                        </div>
                    </div>
                </div>

                {/* Ideology Badge */}
                <div className="flex items-center gap-2">
                    <div
                        className="px-2 py-0.5 text-[9px] uppercase tracking-wider border"
                        style={{ color: quadrantColor, borderColor: `${quadrantColor}40`, backgroundColor: `${quadrantColor}10` }}
                    >
                        {flavorLabel}
                    </div>
                    {perceivedLabel && perceivedLabel !== flavorLabel && (
                        <div className="px-2 py-0.5 text-[9px] uppercase tracking-wider border border-slate-700 text-slate-500 italic">
                            PERCEIVED: {perceivedLabel}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Core Stats ───────────────────────────────────────────── */}
            <div className="px-4 py-2 border-b border-slate-800">
                <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-2">Core Metrics</div>
                <StatRow label="Authority (AUT)" value={typeof aut === "number" ? aut.toFixed(1) : aut} color="text-amber-accent" />
                <StatRow label="Stability (STB)" value={typeof stb === "number" ? stb.toFixed(1) : stb}
                    color={(typeof stb === "number" && stb < 30) ? "text-red-400" : "text-emerald-400"} />
                <StatRow label="Approval (APP)" value={typeof app === "number" ? `${app.toFixed(0)}%` : app} />
                <StatRow label="Global Fear Index" value={system?.fear_index?.toFixed(2) ?? "0.00"} color="text-red-500" />
                <StatRow label="Volatility" value={system?.volatility?.toFixed(1) ?? "0.0"} />
            </div>

            {/* ── Ideology Position ─────────────────────────────────────── */}
            <div className="px-4 py-2 border-b border-slate-800">
                <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-2">Ideological Position</div>
                <StatRow label="Economic Axis" value={(ex >= 0 ? "+" : "") + ex.toFixed(2)} />
                <StatRow label="Authority Axis" value={(ey >= 0 ? "+" : "") + ey.toFixed(2)} />
                {ideology?.veil_gap != null && ideology.veil_gap > 0 && (
                    <StatRow
                        label="Veil Gap"
                        value={ideology.veil_gap.toFixed(2)}
                        color={ideology.veil_gap >= 3.5 ? "text-red-400" : ideology.veil_gap >= 2.5 ? "text-orange-400" : "text-slate-400"}
                    />
                )}
            </div>

            {/* ── Estate Influence ─────────────────────────────────────── */}
            {config?.mappings?.demographics && (
                <div className="px-4 py-2 flex-1">
                    <div className="text-[8px] text-slate-600 uppercase tracking-widest mb-3">Estate Pressures</div>
                    {Object.entries(config.mappings.demographics).map(([key, label]: any) => (
                        <div key={key} className="mb-3">
                            <div className="flex justify-between mb-1">
                                <span className="text-[9px] text-slate-400 uppercase">{label}</span>
                                <span className="text-[9px] text-amber-accent/70">
                                    {gameState.demographics?.[key]?.toFixed(0) ?? 50}%
                                </span>
                            </div>
                            <div className="h-1 bg-slate-900 border border-slate-800 overflow-hidden">
                                <div
                                    className="h-full transition-all duration-700"
                                    style={{
                                        width: `${gameState.demographics?.[key] ?? 50}%`,
                                        backgroundColor: quadrantColor,
                                        boxShadow: `0 0 6px ${quadrantColor}60`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Current Date ─────────────────────────────────────────── */}
            <div className="px-4 py-2 border-t border-slate-800 text-center">
                <span className="text-[9px] text-slate-600 uppercase tracking-widest">Chronos Sync: </span>
                <span className="text-[10px] font-mono text-emerald-400">{gameState.current_date ?? "——"}</span>
            </div>
        </div>
    );
};
