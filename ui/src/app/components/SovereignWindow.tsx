"use client";

import React, { useRef } from "react";
import { Rnd } from "react-rnd";
import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, Minimize2, Minus } from "lucide-react";
import { useWindowManager } from "../../context/WindowManager";

interface SovereignWindowProps {
    id: string;
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    /** Override: render as a fixed fullscreen overlay (managed externally) */
    fullscreen?: boolean;
    onFullscreenToggle?: () => void;
}

export const SovereignWindow = ({
    id,
    title,
    icon,
    children,
    className = "",
    fullscreen = false,
    onFullscreenToggle,
}: SovereignWindowProps) => {
    const { windows, bringToFront, closeWindow, toggleMaximize, updatePosition, updateSize } = useWindowManager();
    const win = windows[id];

    if (!win || !win.isOpen) return null;

    const isMaximized = win.isMaximized || fullscreen;

    return (
        <AnimatePresence>
            {win.isOpen && (
                <Rnd
                    key={id}
                    size={isMaximized ? { width: "100vw", height: "100vh" } : win.size}
                    position={isMaximized ? { x: 0, y: 0 } : win.position}
                    onDragStop={(_, d) => updatePosition(id, { x: d.x, y: d.y })}
                    onResizeStop={(_, __, ref, ___, pos) => {
                        updateSize(id, {
                            width: parseInt(ref.style.width),
                            height: parseInt(ref.style.height),
                        });
                        updatePosition(id, pos);
                    }}
                    bounds="parent"
                    dragHandleClassName="sovereign-drag-handle"
                    disableDragging={isMaximized}
                    enableResizing={!isMaximized}
                    style={{ zIndex: win.zIndex }}
                    minWidth={200}
                    minHeight={160}
                    cancel=".no-drag"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        onMouseDown={() => bringToFront(id)}
                        className={`
                            flex flex-col w-full h-full
                            bg-[#0a0c10] border border-slate-700/70
                            shadow-[0_0_30px_rgba(0,0,0,0.8)]
                            ${className}
                        `}
                        style={{
                            boxShadow: win.zIndex >= 50
                                ? "0 0 0 1px rgba(255,176,0,0.25), 0 0 40px rgba(0,0,0,0.9)"
                                : "0 0 30px rgba(0,0,0,0.8)",
                        }}
                    >
                        {/* ── Title Bar (drag handle) ────────────────────── */}
                        <div
                            className="sovereign-drag-handle flex items-center justify-between px-3 py-1.5 border-b border-slate-800 bg-[#0d1017] cursor-grab active:cursor-grabbing select-none shrink-0"
                            onDoubleClick={() => toggleMaximize(id)}
                        >
                            <div className="flex items-center gap-2">
                                {icon && <span className="text-amber-accent/70 w-3 h-3">{icon}</span>}
                                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                                    {title}
                                </span>
                            </div>

                            <div className="flex items-center gap-1 no-drag">
                                {onFullscreenToggle && (
                                    <button
                                        onClick={onFullscreenToggle}
                                        className="p-0.5 text-slate-600 hover:text-amber-accent transition-colors"
                                        title="Fullscreen"
                                    >
                                        <Maximize2 className="w-2.5 h-2.5" />
                                    </button>
                                )}
                                <button
                                    onClick={() => toggleMaximize(id)}
                                    className="p-0.5 text-slate-600 hover:text-slate-300 transition-colors"
                                    title="Maximize"
                                >
                                    {win.isMaximized ? <Minimize2 className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                                </button>
                                <button
                                    onClick={() => closeWindow(id)}
                                    className="p-0.5 text-slate-600 hover:text-red-400 transition-colors"
                                    title="Close"
                                >
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            </div>
                        </div>

                        {/* ── Scanline accent ───────────────────────────── */}
                        <div
                            className="shrink-0 h-px w-full opacity-20 pointer-events-none"
                            style={{
                                background: "linear-gradient(to right, transparent, rgba(255,176,0,0.6), transparent)"
                            }}
                        />

                        {/* ── Content ───────────────────────────────────── */}
                        <div className="flex-1 overflow-auto min-h-0 no-drag">
                            {children}
                        </div>
                    </motion.div>
                </Rnd>
            )}
        </AnimatePresence>
    );
};
