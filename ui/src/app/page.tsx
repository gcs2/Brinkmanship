"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Save, RotateCcw, Play, Pause, List, ChevronDown, User, Map, LayoutGrid } from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { WindowProvider, useWindowManager } from "../context/WindowManager";
import { SovereignWindow } from "./components/SovereignWindow";
import WaveformOscillator from "./components/WaveformOscillator";
import TacticalMap from "./components/TacticalMap";
import DossierPane from "./components/DossierPane";
import IntelFeed from "./components/IntelFeed";
import { IdentityPanel } from "./components/IdentityPanel";
import IdeologyCompass from "./components/IdeologyCompass";
import { IdeologyGrid } from "./components/IdeologyGrid";
import { CountryProfile } from "./components/CountryProfile";

// ── Inner app (needs WindowManager context) ───────────────────────────────────

function AppInner() {
  const { windows, toggleWindow, openWindow, resetLayout } = useWindowManager();

  const [config, setConfig] = useState<any>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [showScenarioMenu, setShowScenarioMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [velocityShock, setVelocityShock] = useState(false);
  const [showIdeologyGrid, setShowIdeologyGrid] = useState(false);

  // Management guardrail: store wasTicking before fullscreen expand
  const wasTickingRef = useRef(false);
  const prevLogsRef = useRef<string[]>([]);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = useCallback(async (force = false) => {
    try {
      if (!config || force) {
        const configRes = await fetch("http://localhost:8000/api/config");
        if (configRes.ok) setConfig(await configRes.json());
        const scenRes = await fetch("http://localhost:8000/api/scenarios");
        if (scenRes.ok) setScenarios((await scenRes.json()).scenarios);
      }
      const stateRes = await fetch("http://localhost:8000/api/state");
      if (stateRes.ok) {
        const newState = await stateRes.json();
        setGameState(newState);
        // Velocity shock detection (IDX-009)
        const newLogs: string[] = newState?.action_logs ?? [];
        const prevLogs = prevLogsRef.current;
        if (newLogs.some((l: string) => l.includes("VELOCITY SHOCK") && !prevLogs.includes(l))) {
          setVelocityShock(true);
          setTimeout(() => setVelocityShock(false), 2600);
        }
        prevLogsRef.current = newLogs;
      }
    } catch { }
  }, [config]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleNextTurn = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/api/turn", { method: "POST" });
      const data = await res.json();
      setGameState(data.new_state);
      if (!activeEvent) {
        const evtRes = await fetch("http://localhost:8000/api/next_event");
        if (evtRes.ok) {
          const evtData = await evtRes.json();
          if (evtData.event) {
            setActiveEvent(evtData.event);
            setIsPlaying(false);
            showNotif("CRITICAL INTELLIGENCE RECEIVED. PAUSING TIME.");
          }
        }
      }
    } catch { }
  }, [activeEvent]);

  // Spacebar + autoplay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !activeEvent && !showIdeologyGrid) {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    let interval: NodeJS.Timeout;
    if (isPlaying && !activeEvent) interval = setInterval(handleNextTurn, 1000);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, activeEvent, handleNextTurn, showIdeologyGrid]);

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
      setIsPlaying(true);
    } catch { }
    setActiveEvent(null);
  };

  const handleSave = async () => fetch("http://localhost:8000/api/save", { method: "POST" }).then(() => showNotif("Anchor saved."));
  const handleLoad = async () => fetch("http://localhost:8000/api/load", { method: "POST" })
    .then(res => res.json()).then(data => { setGameState(data.new_state); showNotif("Timeline recalled."); setIsPlaying(false); });

  // Expand ideology grid — store wasTicking, pause engine
  const openIdeologyGrid = () => {
    wasTickingRef.current = isPlaying;
    setIsPlaying(false);
    setShowIdeologyGrid(true);
  };

  // Close ideology grid — only resume if was ticking (management guardrail)
  const closeIdeologyGrid = () => {
    setShowIdeologyGrid(false);
    if (wasTickingRef.current) setIsPlaying(true);
  };

  const ideology = gameState?.player_ideology;

  return (
    // Relative canvas — all SovereignWindows are positioned absolute within
    <div className="relative w-screen h-screen bg-[#05070a] overflow-hidden font-mono">

      {/* ── Crisis Event Pane (always on top) ────────────────────── */}
      <DossierPane
        event={activeEvent}
        onSelectOption={resolveEvent}
        onDismiss={() => { setActiveEvent(null); setIsPlaying(true); }}
      />

      {/* ── Ideology Grid fullscreen overlay ─────────────────────── */}
      <AnimatePresence>
        {showIdeologyGrid && (
          <IdeologyGrid
            currentPos={ideology?.position ?? undefined}
            perceivedPos={ideology?.perceived_position ?? undefined}
            positionHistory={ideology?.position_history ?? []}
            flavorLabel={ideology?.flavor_label}
            perceivedFlavorLabel={ideology?.perceived_flavor_label}
            onClose={closeIdeologyGrid}
          />
        )}
      </AnimatePresence>

      {/* ── Notification Toast ────────────────────────────────────── */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1200] bg-[#0d1017] border border-amber-accent/30 px-6 py-3 text-[10px] font-mono text-amber-accent uppercase shadow-lg backdrop-blur-sm">
          {notification}
        </div>
      )}

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-[500] flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-[#07090d]/90 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-lg font-mono tracking-widest text-[#e0e0e0]">BRINKMANSHIP</h1>
            <p className="text-[9px] font-mono text-amber-accent/70 uppercase tracking-widest">
              {config?.theme_name || "INITIALIZING..."}
            </p>
          </div>

          {/* Window toggles */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-6 ml-2">
            {[
              { id: "country", icon: User, label: "Profile" },
              { id: "worldMap", icon: Map, label: "Map" },
              { id: "ideology", icon: LayoutGrid, label: "Compass" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => toggleWindow(id)}
                className={`flex items-center gap-1 px-2 py-1 border text-[9px] uppercase tracking-wider transition-colors ${windows[id]?.isOpen
                    ? "border-amber-accent/40 text-amber-accent bg-amber-accent/5"
                    : "border-slate-800 text-slate-600 hover:text-slate-400"
                  }`}
              >
                <Icon className="w-2.5 h-2.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Reset Layout */}
          <button
            onClick={() => { resetLayout(); showNotif("Layout reset to defaults."); }}
            className="px-2 py-1 border border-slate-800 text-slate-600 text-[9px] uppercase hover:text-slate-400 hover:border-slate-700 transition-colors"
            title="Reset window layout to defaults"
          >
            Reset Layout
          </button>

          <button onClick={handleSave} className="px-3 py-1.5 border border-slate-700 text-slate-400 text-[9px] uppercase hover:text-slate-300 flex items-center gap-1.5"><Save className="w-3 h-3" /> Anchor</button>
          <button onClick={handleLoad} className="px-3 py-1.5 border border-slate-700 text-slate-400 text-[9px] uppercase hover:text-slate-300 flex items-center gap-1.5"><RotateCcw className="w-3 h-3" /> Recall</button>

          {/* Scenario switcher */}
          <div className="relative">
            <button onClick={() => setShowScenarioMenu(!showScenarioMenu)} className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 text-slate-400 text-[9px] uppercase hover:text-slate-300">
              <List className="w-3 h-3" /> Config <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
            {showScenarioMenu && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-[#0d1017] border border-slate-700 shadow-xl z-[600]">
                {scenarios.map(sc => (
                  <button key={sc} onClick={async () => {
                    if (sc === gameState?.active_scenario) return setShowScenarioMenu(false);
                    setIsPlaying(false); setShowScenarioMenu(false);
                    setGameState(null); setActiveEvent(null); setConfig(null);
                    try {
                      const res = await fetch("http://localhost:8000/api/load_scenario", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scenario_id: sc }) });
                      const data = await res.json();
                      setGameState(data.new_state);
                      showNotif(`INITIALIZING: ${data.theme.toUpperCase()}`);
                      fetchData(true);
                    } catch { }
                  }} className="w-full text-left px-4 py-3 text-[9px] font-mono uppercase text-slate-400 hover:bg-slate-700/50 hover:text-[#e0e0e0] border-b border-slate-700/50 last:border-0">
                    Load {sc.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chronos control */}
          <button
            onClick={() => !activeEvent && setIsPlaying(!isPlaying)}
            disabled={!!activeEvent}
            className={`flex items-center gap-2 px-5 py-2 text-xs uppercase tracking-widest transition-colors ${isPlaying ? "bg-amber-accent text-[#07090d]" : "border border-amber-accent/30 text-amber-accent hover:bg-amber-accent/10"}`}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isPlaying ? "HALT (SPACE)" : "CHRONOS (SPACE)"}
          </button>

          {/* Date display */}
          <div className="flex flex-col items-end border-l border-slate-800 pl-4">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">Chronos Sync</span>
            <span className="text-lg font-mono text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
              {gameState?.current_date ?? "---- / -- / --"}
            </span>
          </div>
        </div>
      </header>

      {/* ── SOVEREIGN WINDOWS ─────────────────────────────────────── */}

      {/* Identity Panel (fixed — always left, non-draggable) */}
      <div className="absolute top-[56px] left-0 w-[280px] bottom-0 border-r border-slate-800 bg-[#07090d] overflow-y-auto z-[5]">
        {gameState?.player_profile && (
          <IdentityPanel profile={gameState.player_profile} advisors={gameState.advisors || []} />
        )}
      </div>

      {/* World Map window */}
      <SovereignWindow id="worldMap" title="Tactical Overview — Global Theatre">
        <TacticalMap volatility={gameState?.system?.volatility ?? 5} relations={gameState?.relations ?? []} />
      </SovereignWindow>

      {/* Ideology Compass window */}
      <SovereignWindow
        id="ideology"
        title="Ideology Axis — Structural Matrix"
        onFullscreenToggle={openIdeologyGrid}
      >
        <div className="p-3 h-full">
          <IdeologyCompass
            authoritarianLibertarian={ideology?.authoritarian_libertarian ?? 0}
            plannedMarket={ideology?.planned_market ?? 0}
            overtonRadius={ideology?.overton_radius ?? 0.2}
            positionHistory={ideology?.position_history ?? []}
            perceivedPosition={ideology?.perceived_position}
            veilGap={ideology?.veil_gap ?? 0}
            flavorLabel={ideology?.flavor_label}
            perceivedFlavorLabel={ideology?.perceived_flavor_label}
            velocityShock={velocityShock}
          />
        </div>
      </SovereignWindow>

      {/* Country Profile window */}
      <SovereignWindow id="country" title="Country Profile — Sovereign Dossier">
        <CountryProfile gameState={gameState} config={config} />
      </SovereignWindow>

      {/* Primary Telemetry window */}
      <SovereignWindow id="telemetry" title="Primary Telemetry — Phase {gameState?.active_phase ?? 1}">
        <div className="divide-y divide-slate-800/50 overflow-y-auto h-full">
          {gameState?.formatted_metrics?.map((metric: any) => (
            <div key={metric.id} className="group relative px-4 py-3 hover:bg-slate-800/30 transition-colors">
              <div className="flex items-baseline justify-between">
                <span className="text-[9px] text-slate-400 uppercase tracking-wider">{metric.label}</span>
                <span className="text-sm font-mono text-[#e0e0e0]">{metric.value?.toFixed(2) ?? "0.00"}</span>
              </div>
              {metric.tooltip && (
                <div className="absolute left-[80%] top-0 z-50 w-64 p-3 bg-slate-900 border border-amber-accent/50 text-[9px] font-mono text-slate-300 leading-relaxed shadow-2xl hidden group-hover:block pointer-events-none">
                  {metric.tooltip}
                </div>
              )}
            </div>
          ))}
        </div>
      </SovereignWindow>

      {/* Intel Feed window */}
      <SovereignWindow id="intel" title="Intel Feed — Action Logs">
        <div className="p-2 h-full">
          <IntelFeed logs={gameState?.action_logs ?? []} pendingCount={gameState?.pending_actions?.length ?? 0} />
        </div>
      </SovereignWindow>

      {/* Sector Demographics window */}
      <SovereignWindow id="demographics" title="Sector Pressures — Estate Influence">
        <div className="p-4 space-y-3 h-full overflow-y-auto">
          {config?.mappings?.demographics && Object.entries(config.mappings.demographics).map(([key, label]: any) => (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span className="text-[9px] text-slate-400 uppercase">{label}</span>
                <span className="text-[9px] text-amber-accent/70">{gameState?.demographics?.[key]?.toFixed(0) ?? 50}%</span>
              </div>
              <div className="h-1.5 bg-slate-900 border border-slate-800 overflow-hidden">
                <div
                  className="bg-amber-accent h-full shadow-[0_0_10px_rgba(255,176,0,0.5)] transition-all duration-1000"
                  style={{ width: `${gameState?.demographics?.[key] ?? 50}%` }}
                />
              </div>
            </div>
          ))}
          {/* GFI */}
          <div className="mt-4 pt-4 border-t border-slate-800 text-center">
            <div className="text-[9px] text-red-500 uppercase tracking-widest mb-1">Global Fear Index</div>
            <div className="text-3xl font-mono text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
              {gameState?.system?.fear_index?.toFixed(2) ?? "00.00"}
            </div>
          </div>
        </div>
      </SovereignWindow>
    </div>
  );
}

// ── Root export wraps with WindowProvider ─────────────────────────────────────

export default function Home() {
  return (
    <WindowProvider>
      <AppInner />
    </WindowProvider>
  );
}
