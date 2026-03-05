"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WindowState {
    id: string;
    isOpen: boolean;
    zIndex: number;
    isMaximized: boolean;
    position: { x: number; y: number };
    size: { width: number; height: number };
}

type WindowId = "ideology" | "worldMap" | "country" | "telemetry" | "intel" | "demographics";

interface WindowManagerContextValue {
    windows: Record<string, WindowState>;
    bringToFront: (id: string) => void;
    openWindow: (id: string) => void;
    closeWindow: (id: string) => void;
    toggleWindow: (id: string) => void;
    toggleMaximize: (id: string) => void;
    updatePosition: (id: string, pos: { x: number; y: number }) => void;
    updateSize: (id: string, size: { width: number; height: number }) => void;
    resetLayout: () => void;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_WINDOWS: Record<string, WindowState> = {
    ideology: {
        id: "ideology",
        isOpen: true,
        zIndex: 10,
        isMaximized: false,
        position: { x: 16, y: 420 },
        size: { width: 300, height: 320 },
    },
    worldMap: {
        id: "worldMap",
        isOpen: true,
        zIndex: 8,
        isMaximized: false,
        position: { x: 330, y: 80 },
        size: { width: 780, height: 440 },
    },
    country: {
        id: "country",
        isOpen: false,
        zIndex: 5,
        isMaximized: false,
        position: { x: 340, y: 100 },
        size: { width: 360, height: 480 },
    },
    telemetry: {
        id: "telemetry",
        isOpen: true,
        zIndex: 7,
        isMaximized: false,
        position: { x: 16, y: 120 },
        size: { width: 300, height: 280 },
    },
    intel: {
        id: "intel",
        isOpen: true,
        zIndex: 6,
        isMaximized: false,
        position: { x: 1130, y: 80 },
        size: { width: 260, height: 360 },
    },
    demographics: {
        id: "demographics",
        isOpen: true,
        zIndex: 5,
        isMaximized: false,
        position: { x: 1130, y: 460 },
        size: { width: 260, height: 340 },
    },
};

const STORAGE_KEY = "brinkmanship_window_layout";

// ── Context ───────────────────────────────────────────────────────────────────

export const WindowManagerContext = createContext<WindowManagerContextValue | null>(null);

export const WindowProvider = ({ children }: { children: React.ReactNode }) => {
    const [windows, setWindows] = useState<Record<string, WindowState>>(() => {
        if (typeof window === "undefined") return DEFAULT_WINDOWS;
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with defaults to handle new windows added after layout was saved
                return { ...DEFAULT_WINDOWS, ...parsed };
            }
        } catch { /* ignore parse errors */ }
        return DEFAULT_WINDOWS;
    });

    // Persist to localStorage on every change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(windows));
        } catch { /* ignore quota errors */ }
    }, [windows]);

    const getMaxZ = useCallback((wins: Record<string, WindowState>) =>
        Math.max(...Object.values(wins).map(w => w.zIndex), 0), []);

    // bringToFront is called on onMouseDown per management guardrail
    const bringToFront = useCallback((id: string) => {
        setWindows(prev => {
            const maxZ = getMaxZ(prev);
            if (prev[id]?.zIndex === maxZ) return prev; // Already on top
            return { ...prev, [id]: { ...prev[id], zIndex: maxZ + 1 } };
        });
    }, [getMaxZ]);

    const openWindow = useCallback((id: string) => {
        setWindows(prev => {
            const maxZ = getMaxZ(prev);
            return { ...prev, [id]: { ...prev[id], isOpen: true, zIndex: maxZ + 1 } };
        });
    }, [getMaxZ]);

    const closeWindow = useCallback((id: string) => {
        setWindows(prev => ({ ...prev, [id]: { ...prev[id], isOpen: false } }));
    }, []);

    const toggleWindow = useCallback((id: string) => {
        setWindows(prev => {
            if (prev[id]?.isOpen) {
                return { ...prev, [id]: { ...prev[id], isOpen: false } };
            }
            const maxZ = getMaxZ(prev);
            return { ...prev, [id]: { ...prev[id], isOpen: true, zIndex: maxZ + 1 } };
        });
    }, [getMaxZ]);

    const toggleMaximize = useCallback((id: string) => {
        setWindows(prev => {
            const maxZ = getMaxZ(prev);
            return {
                ...prev,
                [id]: { ...prev[id], isMaximized: !prev[id].isMaximized, zIndex: maxZ + 1 }
            };
        });
    }, [getMaxZ]);

    const updatePosition = useCallback((id: string, pos: { x: number; y: number }) => {
        setWindows(prev => ({ ...prev, [id]: { ...prev[id], position: pos } }));
    }, []);

    const updateSize = useCallback((id: string, size: { width: number; height: number }) => {
        setWindows(prev => ({ ...prev, [id]: { ...prev[id], size } }));
    }, []);

    const resetLayout = useCallback(() => {
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
        setWindows(DEFAULT_WINDOWS);
    }, []);

    return (
        <WindowManagerContext.Provider value={{
            windows, bringToFront, openWindow, closeWindow, toggleWindow,
            toggleMaximize, updatePosition, updateSize, resetLayout,
        }}>
            {children}
        </WindowManagerContext.Provider>
    );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useWindowManager = () => {
    const ctx = useContext(WindowManagerContext);
    if (!ctx) throw new Error("useWindowManager must be used inside <WindowProvider>");
    return ctx;
};
