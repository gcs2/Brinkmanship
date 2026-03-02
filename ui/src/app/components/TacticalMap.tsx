"use client";

import React, { useMemo } from "react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Sphere,
    Graticule,
    Marker
} from "react-simple-maps";

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

const TacticalMap = ({ volatility, relations = [] }: TacticalMapProps) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // Create a dictionary for fast color lookup by country ID (if using ISO codes instead of arbitrary coords later)
    // For now we map pins.

    // Determine pin color based on approval
    const getPinColor = (approval: number) => {
        if (approval >= 70) return "#10B981"; // Emerald
        if (approval <= 30) return "#EF4444"; // Red
        return "#F59E0B"; // Amber
    };

    if (!mounted) {
        return <div className="w-full h-full bg-noir-900 border border-slate-700 rounded-sm" />;
    }

    return (
        <div className="w-full h-full bg-noir-900 border border-slate-700 rounded-sm overflow-hidden relative shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
            {/* Scanline Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

            <ComposableMap
                projectionConfig={{
                    rotate: [-10, 0, 0],
                    scale: 147
                }}
                className="w-full h-full"
            >
                <Sphere stroke="#1f2127" strokeWidth={0.5} fill="transparent" id="map-sphere" />
                <Graticule stroke="#1f2127" strokeWidth={0.5} />
                <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                        geographies.map((geo) => (
                            <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill="#121316"
                                stroke="#1f2127"
                                strokeWidth={0.5}
                                style={{
                                    default: { outline: "none" },
                                    hover: { fill: "#FFB000", outline: "none", opacity: 0.8 },
                                    pressed: { fill: "#E42D2D", outline: "none" },
                                }}
                            />
                        ))
                    }
                </Geographies>

                {/* Draw Relation Pins */}
                {relations.map((rel) => (
                    <Marker key={rel.id} coordinates={[rel.lon, rel.lat]}>
                        <g className="group cursor-pointer">
                            <circle
                                r={4}
                                fill={getPinColor(rel.approval)}
                                className="opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <circle
                                r={12}
                                fill="transparent"
                                stroke={getPinColor(rel.approval)}
                                strokeWidth={0.5}
                                className="opacity-0 group-hover:opacity-50 group-hover:animate-ping"
                            />
                            <text
                                textAnchor="middle"
                                y={-10}
                                className="opacity-0 group-hover:opacity-100 fill-slate-300 font-mono text-[8px] uppercase tracking-wider transition-opacity"
                            >
                                {rel.name}: {rel.approval}%
                            </text>
                        </g>
                    </Marker>
                ))}

            </ComposableMap>

            {/* HUD Elements */}
            <div className="absolute bottom-4 left-4 font-mono text-[10px] text-slate-500 tracking-tighter uppercase">
                Sector: GLOBAL // Volatility: {volatility.toFixed(1)}
            </div>
        </div>
    );
};

export default TacticalMap;
