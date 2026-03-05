"use client";

import React from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Sphere,
    Graticule,
    Marker
} from "react-simple-maps";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface Relation {
    id: string;
    lat: number;
    lon: number;
    approval: number;
    name: string;
}

interface TacticalMapProps {
    volatility: number;
    relations?: Relation[];
}

const getPinColor = (approval: number) => {
    if (approval >= 70) return "#10B981";
    if (approval <= 30) return "#EF4444";
    return "#F59E0B";
};

const TacticalMap = ({ volatility, relations = [] }: TacticalMapProps) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => { setMounted(true); }, []);

    if (!mounted) {
        return <div className="w-full h-full bg-[#07090d]" />;
    }

    return (
        <div className="w-full h-full bg-[#07090d] relative overflow-hidden">

            {/* CRT Scanline overlay — surveillance aesthetic */}
            <div
                className="absolute inset-0 pointer-events-none z-10 opacity-[0.04]"
                style={{
                    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.8) 2px, rgba(0,0,0,0.8) 4px)",
                }}
            />

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none z-10"
                style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%)" }}
            />

            {/* Zoom/Pan Wrapper */}
            <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={8}
                wheel={{ step: 0.15 }}
                doubleClick={{ mode: "zoomIn" }}
                limitToBounds={false}
            >
                {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                        <TransformComponent
                            wrapperStyle={{ width: "100%", height: "100%" }}
                            contentStyle={{ width: "100%", height: "100%" }}
                        >
                            <ComposableMap
                                projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
                                style={{ width: "100%", height: "100%" }}
                            >
                                <Sphere stroke="#141820" strokeWidth={0.5} fill="#07090d" id="map-sphere" />
                                <Graticule stroke="#141820" strokeWidth={0.3} />
                                <Geographies geography={geoUrl}>
                                    {({ geographies }) =>
                                        geographies.map((geo) => (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill="#0f1318"
                                                stroke="rgba(255,176,0,0.18)"
                                                strokeWidth={0.4}
                                                style={{
                                                    default: { outline: "none" },
                                                    hover: { fill: "rgba(255,176,0,0.12)", stroke: "rgba(255,176,0,0.6)", strokeWidth: 0.8, outline: "none" },
                                                    pressed: { fill: "rgba(255,50,50,0.15)", outline: "none" },
                                                }}
                                            />
                                        ))
                                    }
                                </Geographies>

                                {relations.map((rel) => (
                                    <Marker key={rel.id} coordinates={[rel.lon, rel.lat]}>
                                        <g className="group cursor-pointer">
                                            <circle r={4} fill={getPinColor(rel.approval)} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <circle r={12} fill="transparent" stroke={getPinColor(rel.approval)} strokeWidth={0.5} className="opacity-0 group-hover:opacity-50" />
                                            <text textAnchor="middle" y={-10} style={{ fill: "#94A3B8", fontSize: "8px", fontFamily: "monospace" }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                {rel.name}: {rel.approval}%
                                            </text>
                                        </g>
                                    </Marker>
                                ))}
                            </ComposableMap>
                        </TransformComponent>

                        {/* Zoom Controls */}
                        <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1">
                            {[
                                { label: "+", action: zoomIn },
                                { label: "−", action: zoomOut },
                                { label: "⊙", action: resetTransform },
                            ].map(({ label, action }) => (
                                <button
                                    key={label}
                                    onClick={() => action()}
                                    className="w-6 h-6 border border-slate-700 bg-slate-900/80 text-slate-400 hover:text-amber-accent hover:border-amber-accent/40 text-xs font-mono transition-colors backdrop-blur-sm"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </TransformWrapper>

            {/* HUD footer */}
            <div className="absolute bottom-3 left-3 z-20 font-mono text-[9px] text-slate-600 uppercase tracking-tighter">
                SECTOR: GLOBAL // VOLATILITY: {volatility.toFixed(1)}
            </div>
        </div>
    );
};

export default TacticalMap;
