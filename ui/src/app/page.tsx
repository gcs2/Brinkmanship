"use client";

import { useEffect, useState, useCallback } from "react";
import { Activity, ShieldAlert, Zap, Save, RotateCcw } from "lucide-react";
import WaveformOscillator from "./components/WaveformOscillator";
import TacticalMap from "./components/TacticalMap";
import DossierPane from "./components/DossierPane";
import IntelFeed from "./components/IntelFeed";

interface PendingAction {
  action_id: string;
  source_event: string;
  option_label: string;
  target: string;
  resolve_on_turn: number;
}

interface MetricState {
  id: string;
  label: string;
  tooltip: string;
  value: number;
  volatility: number;
  trend: number[];
}

interface GameState {
  turn_id: number;
  current_date: string;
  active_phase: number;
  phase_name: string;
  metrics: Record<string, number>;
  demographics: Record<string, number>;
  system: Record<string, number>;
  formatted_metrics: MetricState[];
  pending_actions: PendingAction[];
  action_logs: string[];
  volatility_history: number[];
}

interface ScenarioConfig {
  theme_name: string;
  mappings: {
    metrics: Record<string, string>;
    metric_tooltips: Record<string, string>;
    demographics: Record<string, string>;
  };
}

const PHASE_COLORS: Record<number, string> = {
  1: "text-emerald-500 border-emerald-500/30",
  2: "text-amber-accent border-amber-accent/30",
  3: "text-red-500 border-red-500/30",
};

export default function Home() {
  const [config, setConfig] = useState<ScenarioConfig | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [savePending, setSavePending] = useState(false);

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchData = useCallback(async () => {
    try {
      const configRes = await fetch("http://localhost:8000/api/config");
      if (!configRes.ok) return;
      setConfig(await configRes.json());

      const stateRes = await fetch("http://localhost:8000/api/state");
      if (!stateRes.ok) return;
      setGameState(await stateRes.json());
    } catch { }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleNextTurn = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/turn", { method: "POST" });
      const data = await res.json();
      setGameState(data.new_state);

      // Phase 6: Pick an event from scenario based on phase
      if (data.new_state.active_phase >= 2 && data.new_state.turn_id % 5 === 0) {
        setActiveEvent({
          id: "CHINA_EMBARGO_001",
          title: "The Silicon Shield Drops",
          description: "Beijing has announced an 'Environmental Audit' on all semiconductor exports. Supply chains are freezing. The White House Situation Room is lit up.",
          options: [
            { id: "OPT_A", label: "WTO Complaint & Domestic Subsidies", description: "Bet on domestic manufacturing over 15 days.", lag_time: 15 },
            { id: "OPT_B", label: "Tariff Rollback Negotiation", description: "Offer agricultural concessions. Quick but costly diplomatically.", lag_time: 7 },
            { id: "OPT_C", label: "Rally Allies: G7 Counter-Response", description: "Build a coalition. Slow, but powerful if it holds.", lag_time: 21 },
            { id: "OPT_D", label: "Activate Strategic Reserve", description: "Buy time using stockpiles. Short-term fix only.", lag_time: 5 },
            { id: "OPT_E", label: "Targeted Sanctions on PRC Firms", description: "Fast, aggressive. High risk of blowback.", lag_time: 3 },
          ]
        });
      } else if (data.new_state.active_phase === 1 && data.new_state.turn_id % 7 === 0) {
        setActiveEvent({
          id: "MUNDANE_BUDGET_001",
          title: "The Annual Budget Hearing",
          description: "The Congressional Budget Office projects a modest 1.2% deficit overage. The OMB director wants direction before the floor vote.",
          options: [
            { id: "OPT_A", label: "Fiscal Hawk: Force Spending Cuts", description: "Markets love it. Workers won't.", lag_time: 10 },
            { id: "OPT_B", label: "Stimulus: Infrastructure Spending", description: "Create jobs now, pay CPI later.", lag_time: 14 },
            { id: "OPT_C", label: "Defer & Audit", description: "Buy time. Looks weak but might expose waste.", lag_time: 20 },
            { id: "OPT_D", label: "Signal to Markets: Rate Guidance", description: "Quiet influence. Very fast resolution.", lag_time: 3 },
          ]
        });
      }
    } catch { }
  };

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
      showNotif(`Operation queued. Resolving in ~${lag} days. Outcome classified until resolution.`);
    } catch { }
    setActiveEvent(null);
  };

  const handleSave = async () => {
    setSavePending(true);
    await fetch("http://localhost:8000/api/save", { method: "POST" });
    showNotif("State snapshot anchored to disk.");
    setSavePending(false);
  };

  const handleLoad = async () => {
    const res = await fetch("http://localhost:8000/api/load", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setGameState(data.new_state);
      showNotif("Timeline recalled from anchor.");
    }
  };

  const currentPhase = gameState?.active_phase ?? 1;
  const phaseClass = PHASE_COLORS[currentPhase] ?? PHASE_COLORS[1];

  return (
    <div className="relative flex flex-col items-center min-h-screen p-6 bg-noir-900">
      {/* Non-blocking Dossier Pane */}
      <DossierPane event={activeEvent} onSelectOption={resolveEvent} onDismiss={() => setActiveEvent(null)} />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-noir-800 border border-amber-accent/30 px-6 py-3 text-xs font-mono text-amber-accent uppercase tracking-widest shadow-lg">
          {notification}
        </div>
      )}

      {/* Title Bar */}
      <header className="w-full max-w-[1600px] flex items-center justify-between border-b border-slate-700 pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-mono tracking-widest text-[#e0e0e0]">BRINKMANSHIP</h1>
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">
            {config?.theme_name || "INITIALIZING..."}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Phase Indicator */}
          <div className={`px-3 py-1 border font-mono text-[10px] uppercase tracking-widest ${phaseClass}`}>
            Phase {currentPhase}: {gameState?.phase_name ?? "—"}
          </div>

          {/* Save / Load */}
          <button onClick={handleSave} disabled={savePending}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 text-slate-400 font-mono text-[10px] uppercase tracking-widest hover:border-slate-500 hover:text-slate-300 transition-colors">
            <Save className="w-3 h-3" />
            {savePending ? "Saving..." : "Anchor"}
          </button>
          <button onClick={handleLoad}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 text-slate-400 font-mono text-[10px] uppercase tracking-widest hover:border-slate-500 hover:text-slate-300 transition-colors">
            <RotateCcw className="w-3 h-3" />
            Recall
          </button>

          <button onClick={handleNextTurn}
            className="flex items-center gap-2 px-5 py-2 border border-amber-accent/30 text-amber-accent font-mono text-xs uppercase tracking-widest hover:bg-amber-accent/10 transition-colors">
            <Zap className="w-3 h-3" />
            Advance Chronos
          </button>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Chronos Sync</span>
            <span className="text-base font-mono text-amber-accent glow-amber">
              {gameState?.current_date ?? "2025-01-20"}
            </span>
          </div>
          <Activity className="w-5 h-5 text-slate-500" />
        </div>
      </header>

      {/* Main Tactical Grid */}
      <div className="w-full max-w-[1600px] grid grid-cols-12 gap-5">

        {/* Left Column: All 9 Metrics with Tooltips */}
        <div className="col-span-3 flex flex-col gap-0 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-4 py-2 border-b border-slate-800">
            Primary Telemetry
          </div>
          <div className="divide-y divide-slate-800/50">
            {gameState?.formatted_metrics.map((metric) => (
              <div key={metric.id} className="group relative px-4 py-3 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                    {metric.label}
                  </span>
                  <span className="text-sm font-mono text-[#e0e0e0]">
                    {metric.value.toFixed(2)}
                  </span>
                </div>
                {/* Tooltip */}
                {metric.tooltip && (
                  <div className="absolute left-full top-0 ml-2 z-50 w-56 p-3 bg-noir-900 border border-slate-700 text-[10px] font-mono text-slate-400 leading-relaxed shadow-xl hidden group-hover:block pointer-events-none">
                    {metric.tooltip}
                  </div>
                )}
              </div>
            ))}
            {!gameState && (
              <div className="px-4 py-3 text-[10px] font-mono text-slate-700">CONNECTING...</div>
            )}
          </div>
        </div>

        {/* Center Column: Map & Oscilloscope */}
        <div className="col-span-6 flex flex-col gap-5">
          <div className="panel aspect-video relative flex items-center justify-center overflow-hidden border border-slate-700">
            <TacticalMap volatility={gameState?.system.volatility ?? 5} />
          </div>

          <div className="panel p-4 h-36 relative overflow-hidden border border-slate-700">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
              Volatility Readout — ECG
            </div>
            <div className="w-full h-full">
              <WaveformOscillator
                volatility={gameState?.system.volatility ?? 5}
                fearIndex={gameState?.system.fear_index ?? 0}
                history={gameState?.volatility_history ?? []}
              />
            </div>
          </div>

          {/* Intel Feed */}
          <div className="panel p-4 h-44 overflow-hidden border border-slate-700">
            <IntelFeed
              logs={gameState?.action_logs ?? []}
              pendingCount={gameState?.pending_actions.length ?? 0}
            />
          </div>
        </div>

        {/* Right Column: Demographics & GFI */}
        <div className="col-span-3 flex flex-col gap-4">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
            Sector Pressures
          </div>
          {config?.mappings.demographics && Object.entries(config.mappings.demographics).map(([key, label]) => (
            <div key={key} className="panel p-4 flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-slate-600" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">{label}</span>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1 border border-slate-800">
                <div
                  className="bg-amber-accent h-full shadow-[0_0_10px_rgba(255,176,0,0.5)] transition-all duration-1000"
                  style={{ width: `${gameState?.demographics[key as keyof typeof gameState.demographics] ?? 50}%` }}
                />
              </div>
              <span className="text-xs font-mono text-slate-500">
                {(gameState?.demographics[key as keyof typeof gameState.demographics] ?? 50).toFixed(1)}%
              </span>
            </div>
          ))}

          {/* Pending Operations */}
          {(gameState?.pending_actions.length ?? 0) > 0 && (
            <div className="panel p-4 border-amber-accent/20 bg-amber-accent/5">
              <div className="text-[10px] text-amber-accent font-mono uppercase tracking-widest mb-2">
                Active Operations
              </div>
              <div className="space-y-2">
                {gameState?.pending_actions.slice(0, 4).map((pa) => (
                  <div key={pa.action_id} className="text-[10px] font-mono text-slate-500 border-l border-amber-accent/20 pl-2">
                    <div className="text-slate-400">{pa.option_label.slice(0, 32)}...</div>
                    <div>Resolves T-{pa.resolve_on_turn}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto panel p-4 border-red-900/30 bg-red-950/10">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span className="text-[10px] text-red-500 uppercase tracking-widest">GFI Escalation</span>
            </div>
            <div className="text-3xl font-mono text-red-400">
              {gameState?.system.fear_index.toFixed(2) ?? "00.00"}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
