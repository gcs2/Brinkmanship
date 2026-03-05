"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

interface IdeologyCompassProps {
    authoritarianLibertarian: number; // -1.0 (Auth) to 1.0 (Lib)
    plannedMarket: number;            // -1.0 (Planned) to 1.0 (Market)
    overtonRadius: number;           // 0.1 to 0.5
}

const IdeologyCompass = ({
    authoritarianLibertarian,
    plannedMarket,
    overtonRadius
}: IdeologyCompassProps) => {
    // Map -1.0 to 1.0 to 0% to 100%
    const x = ((plannedMarket + 1) / 2) * 100;
    const y = ((1 - authoritarianLibertarian) / 2) * 100; // Invert Auth/Lib for Y axis (Auth up)

    const gridLines = useMemo(() => {
        const lines = [];
        for (let i = 0; i <= 10; i++) {
            lines.push(i * 10);
        }
        return lines;
    }, []);

    return (
        <div className="relative w-full aspect-square bg-slate-950 border border-slate-900 overflow-hidden font-mono group">
            {/* Brutalist Grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                {gridLines.map((line) => (
                    <React.Fragment key={line}>
                        <div
                            className="absolute top-0 bottom-0 border-l border-slate-700"
                            style={{ left: `${line}%` }}
                        />
                        <div
                            className="absolute left-0 right-0 border-t border-slate-700"
                            style={{ top: `${line}%` }}
                        />
                    </React.Fragment>
                ))}
            </div>

            {/* Axes Labels */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] text-slate-600 uppercase tracking-tighter">Authoritarian</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[8px] text-slate-600 uppercase tracking-tighter">Libertarian</div>
            <div className="absolute left-2 top-1/2 -rotate-90 origin-left -translate-y-1/2 text-[8px] text-slate-600 uppercase tracking-tighter">Planned</div>
            <div className="absolute right-2 top-1/2 rotate-90 origin-right translate-y-1/2 text-[8px] text-slate-600 uppercase tracking-tighter">Market</div>

            {/* Overton Window Pulsing Perimeter */}
            <motion.div
                initial={false}
                animate={{
                    opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute border border-amber-accent/40 rounded-full bg-amber-accent/5 pointer-events-none"
                style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: `${overtonRadius * 200}%`,
                    height: `${overtonRadius * 200}%`,
                    transform: "translate(-50%, -50%)",
                }}
            />

            {/* Current Position Marker */}
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

            {/* Data Readout Overlay */}
            <div className="absolute bottom-4 left-4 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <span className="text-[8px] text-amber-accent/80">COORDS: {plannedMarket.toFixed(2)}, {authoritarianLibertarian.toFixed(2)}</span>
                <span className="text-[8px] text-slate-500">OVERTON: {overtonRadius.toFixed(2)}</span>
            </div>
        </div>
    );
};

export default IdeologyCompass;
