"use client";

import { useEffect, useState } from "react";
import { GameState, ScenarioConfig, ActiveEvent } from "../../../types";
import { Activity, ShieldAlert, Globe, Crosshair } from "lucide-react";

export default function Home() {
  const [config, setConfig] = useState<ScenarioConfig | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    // We will wire this up to the FastAPI bridge
    // fetch('/api/config')
    // fetch('/api/state')
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-8">
      {/* Title Bar */}
      <header className="w-full max-w-7xl flex items-center justify-between border-b border-slate-700 pb-4 mb-8">
        <div>
          <h1 className="text-3xl font-mono tracking-widest text-[#e0e0e0]">
            BRINKMANSHIP
          </h1>
          <p className="text-sm font-mono text-slate-500 uppercase tracking-widest mt-1">
            {config?.theme_name || "INITIALIZING ENGX_..."}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Chronos Sync</span>
            <span className="text-lg font-mono text-amber-accent glow-amber">
              {gameState?.current_date || "2025-01-20"}
            </span>
          </div>
          <Activity className="w-6 h-6 text-slate-500" />
        </div>
      </header>

      {/* Main Tactical Grid */}
      <div className="w-full max-w-7xl grid grid-cols-12 gap-6">

        {/* Left Column: Core Metrics */}
        <div className="col-span-3 flex flex-col gap-4">
          <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-700 pb-2">
            Primary Telemetry
          </h2>
          {/* We will map the config.metrics here */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="panel p-4 flex flex-col gap-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                Metric 0{i}
              </span>
              <div className="text-2xl font-mono">
                {gameState ? gameState.metrics[`metric_${i}` as keyof typeof gameState.metrics].toFixed(2) : "00.00"}
              </div>
            </div>
          ))}
        </div>

        {/* Center Column: The Map & Oscilloscope */}
        <div className="col-span-6 flex flex-col gap-6">
          <div className="panel aspect-video relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-slate-800/20 z-0"></div>
            {/* react-simple-maps will go here */}
            <Globe className="w-24 h-24 text-slate-700 absolute opacity-50" />
            <span className="relative z-10 text-slate-500 font-mono text-sm tracking-widest">
              AWAITING SPATIAL DATA
            </span>
          </div>

          <div className="panel p-6 h-48 relative overflow-hidden">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest absolute top-4 left-4 z-10">
              Volatility Readout
            </div>
            {/* SVG Waveform Oscillator will go here */}
            <div className="absolute inset-x-0 bottom-4 h-24 flex items-center justify-center border-t border-slate-700/50">
              <span className="text-amber-accent font-mono text-sm">[WAVEFORM RENDER QUEUED]</span>
            </div>
          </div>
        </div>

        {/* Right Column: Demographics & System */}
        <div className="col-span-3 flex flex-col gap-4">
          <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-700 pb-2">
            Sector Pressures
          </h2>
          {[1, 2, 3].map((i) => (
            <div key={i} className="panel p-4 flex flex-col gap-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                Demographic 0{i}
              </span>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-amber-accent h-full shadow-[0_0_10px_rgba(255,176,0,0.5)]"
                  style={{ width: `${gameState ? gameState.demographics[`demo_${i}` as keyof typeof gameState.demographics] : 50}%` }}
                />
              </div>
            </div>
          ))}

          <div className="mt-8 panel p-4 border-red-900/30 bg-red-950/10">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-500 uppercase tracking-widest">
                GFI Escalation
              </span>
            </div>
            <div className="text-3xl font-mono text-red-400">
              {gameState?.system.fear_index.toFixed(2) || "00.00"}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
