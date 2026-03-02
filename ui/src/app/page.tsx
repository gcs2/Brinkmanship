"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Activity, ShieldAlert, Zap, Save, RotateCcw, Play, Pause, List, ChevronDown } from "lucide-react";
import WaveformOscillator from "./components/WaveformOscillator";
import TacticalMap from "./components/TacticalMap";
import DossierPane from "./components/DossierPane";
import IntelFeed from "./components/IntelFeed";
import { IdentityPanel } from "./components/IdentityPanel";

export default function Home() {
  const [config, setConfig] = useState<any>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);

  // Autoplay logic
  const [isPlaying, setIsPlaying] = useState(false);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      if (!config) {
        const configRes = await fetch("http://localhost:8000/api/config");
        if (configRes.ok) setConfig(await configRes.json());

        const scenRes = await fetch("http://localhost:8000/api/scenarios");
        if (scenRes.ok) {
          const scenData = await scenRes.json();
          setScenarios(scenData.scenarios);
        }
      }

      const stateRes = await fetch("http://localhost:8000/api/state");
      if (stateRes.ok) setGameState(await stateRes.json());
    } catch { }
  }, [config]);

  // Background fetch for state updates (if other clients are acting, or just to get config)
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // The Game Loop
  const handleNextTurn = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/api/turn", { method: "POST" });
      const data = await res.json();
      setGameState(data.new_state);

      // Fetch events dynamically rather than hardcoding client-side
      if (!activeEvent) {
        const evtRes = await fetch("http://localhost:8000/api/next_event");
        if (evtRes.ok) {
          const evtData = await evtRes.json();
          if (evtData.event) {
            setActiveEvent(evtData.event);
            setIsPlaying(false); // Auto-pause on event
            showNotif("CRITICAL INTELLIGENCE RECEIVED. PAUSING TIME.");
          }
        }
      }
    } catch { }
  }, [activeEvent]);

  // Spacebar control + Autoplay loop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !activeEvent) {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    let interval: NodeJS.Timeout;
    if (isPlaying && !activeEvent) {
      // Tick every 1000ms
      interval = setInterval(handleNextTurn, 1000);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, activeEvent, handleNextTurn]);


  const resolveEvent = async (optionId: string) => {
    if (!activeEvent) return;
    try {
      const res = await fetch("http://localhost:8000/api/resolve_event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: activeEvent.id, option_id: optionId }),
      });
      const data = await res.json();
      setGameState(data.state);
      const lag = activeEvent.options.find((o: any) => o.id === optionId)?.lag_time ?? "?";
      showNotif(`Operation queued. Resolving in ~${lag} days. Outcomes classified.`);
      setIsPlaying(true); // Auto-resume
    } catch { }
    setActiveEvent(null);
  };

  const handleSave = async () => fetch("http://localhost:8000/api/save", { method: "POST" }).then(() => showNotif("Anchor saved."));
  const handleLoad = async () => fetch("http://localhost:8000/api/load", { method: "POST" }).then(res => res.json()).then(data => { setGameState(data.new_state); showNotif("Timeline recalled."); setIsPlaying(false); });

  const currentPhase = gameState?.active_phase ?? 1;

  return (
    <div className="relative flex flex-col items-center min-h-screen p-6 bg-noir-900 overflow-hidden">
      <DossierPane event={activeEvent} onSelectOption={resolveEvent} onDismiss={() => { setActiveEvent(null); setIsPlaying(true); }} />

      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-noir-800 border border-amber-accent/30 px-6 py-3 text-xs font-mono text-amber-accent uppercase shadow-lg backdrop-blur-sm">
          {notification}
        </div>
      )}

      {/* Header */}
      <header className="w-full max-w-[1600px] flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-2xl font-mono tracking-widest text-[#e0e0e0]">BRINKMANSHIP</h1>
            <p className="text-[10px] font-mono text-amber-500 uppercase tracking-widest mt-1">
              {config?.theme_name || "INITIALIZING..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleSave} className="px-3 py-1.5 border border-slate-700 text-slate-400 font-mono text-[10px] uppercase hover:text-slate-300 flex items-center gap-1.5"><Save className="w-3 h-3" /> Anchor</button>
          <button onClick={handleLoad} className="px-3 py-1.5 border border-slate-700 text-slate-400 font-mono text-[10px] uppercase hover:text-slate-300 flex items-center gap-1.5"><RotateCcw className="w-3 h-3" /> Recall</button>

          <div className="relative">
            <button
              onClick={() => setShowScenarioMenu(!showScenarioMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 text-slate-400 font-mono text-[10px] uppercase hover:text-slate-300 transition-colors"
            >
              <List className="w-3 h-3" />
              Swap Config <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            {showScenarioMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-noir-800 border border-slate-700 shadow-xl z-50">
                {scenarios.map(sc => (
                  <button
                    key={sc}
                    onClick={async () => {
                      if (sc === gameState?.active_scenario) return setShowScenarioMenu(false);
                      setIsPlaying(false);
                      setShowScenarioMenu(false);
                      setGameState(null);
                      setActiveEvent(null);
                      setConfig(null); // force config refetch
                      try {
                        const res = await fetch("http://localhost:8000/api/load_scenario", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ scenario_id: sc })
                        });
                        const data = await res.json();
                        setGameState(data.new_state);
                        showNotif(`INITIALIZING: ${data.theme.toUpperCase()}`);
                        fetchData(); // pull new config mapping
                      } catch { }
                    }}
                    className="w-full text-left px-4 py-3 text-[10px] font-mono uppercase text-slate-400 hover:bg-slate-700/50 hover:text-[#e0e0e0] border-b border-slate-700/50 last:border-0"
                  >
                    Load {sc.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => !activeEvent && setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-5 py-2 font-mono text-xs uppercase tracking-widest transition-colors ${isPlaying ? 'bg-amber-accent text-noir-900' : 'border border-amber-accent/30 text-amber-accent hover:bg-amber-accent/10'}`}
            disabled={!!activeEvent}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isPlaying ? "HALT LOGIC (SPACE)" : "START CHRONOS (SPACE)"}
          </button>

          <div className="flex flex-col items-end border-l border-slate-700 pl-4 ml-2">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Chronos Sync</span>
            <span className="text-xl font-mono text-emerald-400 glow-emerald drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
              {gameState?.current_date ?? "---- / -- / --"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="w-full max-w-[1600px] grid grid-cols-12 gap-5">

        {/* Left: Identity & Telemetry */}
        <div className="col-span-3 flex flex-col gap-5">
          {gameState?.player_profile && (
            <IdentityPanel profile={gameState.player_profile} advisors={gameState.advisors || []} />
          )}

          <div className="border border-slate-800 bg-noir-800/50">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-4 py-2 border-b border-slate-800 flex justify-between">
              <span>Primary Telemetry</span>
              <span className="text-amber-500">PHASE {currentPhase}</span>
            </div>
            <div className="divide-y divide-slate-800/50 max-h-[35vh] overflow-y-auto">
              {gameState?.formatted_metrics.map((metric: any) => (
                <div key={metric.id} className="group relative px-4 py-3 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                      {metric.label}
                    </span>
                    <span className="text-sm font-mono text-[#e0e0e0]">
                      {metric.value.toFixed(2)}
                    </span>
                  </div>
                  {metric.tooltip && (
                    <div className="absolute left-[80%] top-0 z-50 w-64 p-3 bg-slate-900 border border-amber-accent/50 text-[10px] font-mono text-slate-300 leading-relaxed shadow-2xl hidden group-hover:block pointer-events-none">
                      {metric.tooltip}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: Tactical Map & ECG */}
        <div className="col-span-6 flex flex-col gap-5">
          <div className="panel aspect-video relative flex items-center justify-center overflow-hidden border border-slate-700 shadow-2xl">
            <TacticalMap
              volatility={gameState?.system.volatility ?? 5}
              relations={gameState?.relations ?? []}
            />
          </div>

          <div className="grid grid-cols-2 gap-5 h-44">
            <div className="panel p-4 pb-0 relative overflow-hidden border border-slate-700 bg-noir-800/50 flex flex-col">
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 shrink-0">
                Systemic Volatility
              </div>
              <div className="w-full flex-1 min-h-0">
                <WaveformOscillator
                  volatility={gameState?.system.volatility ?? 0}
                  fearIndex={gameState?.system.fear_index ?? 0}
                  history={gameState?.volatility_history ?? []}
                />
              </div>
            </div>

            <div className="panel p-4 relative overflow-hidden border border-slate-700 bg-noir-800/50">
              <IntelFeed
                logs={gameState?.action_logs ?? []}
                pendingCount={gameState?.pending_actions.length ?? 0}
              />
            </div>
          </div>
        </div>

        {/* Right: Demographics & GFI */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
            Sector Pressures
          </div>
          {config?.mappings.demographics && Object.entries(config.mappings.demographics).map(([key, label]: any) => (
            <div key={key} className="panel p-4 flex flex-col gap-2 relative overflow-hidden bg-noir-800/50">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</span>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-800">
                <div
                  className="bg-amber-accent h-full shadow-[0_0_10px_rgba(255,176,0,0.5)] transition-all duration-1000"
                  style={{ width: `${gameState?.demographics[key] ?? 50}%` }}
                />
              </div>
            </div>
          ))}

          {(gameState?.pending_actions.length ?? 0) > 0 && (
            <div className="panel p-4 border-amber-accent/20 bg-amber-accent/5">
              <div className="text-[10px] text-amber-accent font-mono uppercase tracking-widest mb-2">
                Operations En Route
              </div>
              <div className="space-y-2">
                {gameState?.pending_actions.slice(0, 4).map((pa: any) => (
                  <div key={pa.action_id} className="text-[9px] font-mono text-slate-500 border-l border-amber-accent/20 pl-2">
                    <div className="text-slate-400">{pa.option_label.slice(0, 35)}...</div>
                    <div>T-{pa.resolve_on_turn} Days</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto panel p-5 border-red-900/30 bg-red-950/20 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span className="text-[10px] text-red-500 uppercase tracking-widest">Global Fear Index</span>
            </div>
            <div className="text-4xl font-mono text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
              {gameState?.system.fear_index.toFixed(2) ?? "00.00"}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
