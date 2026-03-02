"use client";

import { useEffect, useState } from "react";
import { GameState, ScenarioConfig } from "../../../types";
import { Activity, ShieldAlert, Zap } from "lucide-react";
import WaveformOscillator from "./components/WaveformOscillator";
import TacticalMap from "./components/TacticalMap";
import DossierModal from "./components/DossierModal";

export default function Home() {
  const [config, setConfig] = useState<ScenarioConfig | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeEvent, setActiveEvent] = useState<any>(null);

  const fetchData = async () => {
    try {
      const configRes = await fetch('http://localhost:8000/api/config');
      if (!configRes.ok) throw new Error('API config unreachable');
      const configData = await configRes.json();
      setConfig(configData);

      const stateRes = await fetch('http://localhost:8000/api/state');
      if (!stateRes.ok) throw new Error('API state unreachable');
      const stateData = await stateRes.json();
      setGameState(stateData);
    } catch (error) {
      console.error("Failed to fetch engine data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); // Polling for real-time feel
    return () => clearInterval(interval);
  }, []);

  const handleNextTurn = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/turn', { method: 'POST' });
      const data = await res.json();
      setGameState(data.new_state);

      // For demo, we trigger a random event from the scenario
      if (config?.theme_name && config.theme_name.includes("Modern")) {
        setActiveEvent({
          id: "EVT-CHINA-EMBARGO",
          title: "Semiconductor Blockade",
          description: "Alliance intelligence reports China is weighing a full embargo on high-end silicon. Global markets are pricing in the collapse of the tech sector.",
          options: [
            { id: "A", label: "Aggressive Sanctions", description: "Respond with immediate counter-tariffs on rare earth minerals." },
            { id: "B", label: "Diplomatic Channel", description: "Open a back-channel for silicon-grade negotiations." }
          ]
        });
      }
    } catch (error) {
      console.error("Failed to advance turn:", error);
    }
  };

  const resolveEvent = async (optionId: string) => {
    setActiveEvent(null);
    // In a real app, we'd call http://localhost:8000/api/resolve_event
    await handleNextTurn();
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen p-8 bg-noir-900">
      <DossierModal event={activeEvent} onSelectOption={resolveEvent} />

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
          <button
            onClick={handleNextTurn}
            className="flex items-center gap-2 px-6 py-2 border border-amber-accent/30 text-amber-accent font-mono text-xs uppercase tracking-widest hover:bg-amber-accent/10 transition-colors"
          >
            <Zap className="w-3 h-3" />
            Advance Chronos
          </button>

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
          {config?.metrics && Object.entries(config.metrics).slice(0, 4).map(([key, label], i) => (
            <div key={key} className="panel p-4 flex flex-col gap-2 relative overflow-hidden">
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-slate-600" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                {label}
              </span>
              <div className="text-2xl font-mono">
                {gameState ? gameState.metrics[key as keyof typeof gameState.metrics].toFixed(2) : "00.00"}
              </div>
            </div>
          ))}
        </div>

        {/* Center Column: The Map & Oscilloscope */}
        <div className="col-span-6 flex flex-col gap-6">
          <div className="panel aspect-video relative flex items-center justify-center overflow-hidden border border-slate-700">
            <TacticalMap volatility={gameState?.system.volatility || 15} />
          </div>

          <div className="panel p-6 h-48 relative overflow-hidden border border-slate-700">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-widest absolute top-4 left-4 z-10">
              Volatility Readout
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <WaveformOscillator
                volatility={gameState?.system.volatility || 15}
                fearIndex={gameState?.system.fear_index || 0}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Demographics & System */}
        <div className="col-span-3 flex flex-col gap-4">
          <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-700 pb-2">
            Sector Pressures
          </h2>
          {config?.demographics && Object.entries(config.demographics).map(([key, label], i) => (
            <div key={key} className="panel p-4 flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-slate-600" />
              <span className="text-xs text-slate-400 uppercase tracking-wider">
                {label}
              </span>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-800">
                <div
                  className="bg-amber-accent h-full shadow-[0_0_10px_rgba(255,176,0,0.5)] transition-all duration-1000"
                  style={{ width: `${gameState ? gameState.demographics[key as keyof typeof gameState.demographics] : 50}%` }}
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
